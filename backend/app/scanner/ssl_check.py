"""
VulnScan Lite — SSL/TLS Inspection Module
Verifies certificate validity, expiry, cipher strength
"""

import ssl
import socket
from datetime import datetime


def check_ssl(url: str) -> dict:
    """
    Connect to host and inspect SSL certificate.
    Returns validity, expiry, cipher suite, and grade.
    """
    result = {
        "valid"    : False,
        "issuer"   : None,
        "expires"  : None,
        "days_left": None,
        "version"  : None,
        "cipher"   : None,
        "grade"    : "F",
        "error"    : None
    }

    try:
        # Extract domain from URL
        domain = url.replace("https://", "").replace("http://", "").split("/")[0]

        # Establish SSL connection
        context = ssl.create_default_context()
        conn    = context.wrap_socket(
            socket.socket(socket.AF_INET),
            server_hostname=domain
        )
        conn.settimeout(10)
        conn.connect((domain, 443))

        cert   = conn.getpeercert()
        cipher = conn.cipher()

        # Parse expiry date
        expire_date = datetime.strptime(cert["notAfter"], "%b %d %H:%M:%S %Y %Z")
        days_left   = (expire_date - datetime.utcnow()).days

        # Parse issuer name
        issuer = dict(x[0] for x in cert["issuer"])

        result.update({
            "valid"    : True,
            "issuer"   : issuer.get("organizationName", "Unknown"),
            "expires"  : expire_date.strftime("%Y-%m-%d"),
            "days_left": days_left,
            "version"  : conn.version(),
            "cipher"   : cipher[0],
            "grade"    : _calculate_grade(days_left, conn.version(), cipher[0])
        })

        conn.close()

    except ssl.SSLCertVerificationError:
        result["error"] = "Certificate verification failed"
    except ssl.SSLError as e:
        result["error"] = f"SSL Error: {str(e)}"
    except Exception as e:
        result["error"] = str(e)

    return result


def _calculate_grade(days_left: int, version: str, cipher: str) -> str:
    """
    Grade SSL config based on protocol version and certificate expiry.
    A+ = TLS 1.3 + 60 days left
    A  = TLS 1.3 or TLS 1.2 + 30 days left
    B  = TLS 1.2
    F  = Expired or TLS 1.0/1.1
    """
    if days_left < 0:
        return "F"
    if "TLSv1.3" in version and days_left > 60:
        return "A+"
    if "TLSv1.3" in version or ("TLSv1.2" in version and days_left > 30):
        return "A"
    if "TLSv1.2" in version:
        return "B"
    return "F"