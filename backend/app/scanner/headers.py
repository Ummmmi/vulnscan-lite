"""
VulnScan Lite — Header Analysis Module
Checks presence of critical HTTP security headers
Scoring: +10 for each present, -10 for each missing
"""

import requests

# Headers to check with remediation tips
SECURITY_HEADERS = {
    "Content-Security-Policy": {
        "description": "Prevents XSS attacks by controlling resource loading",
        "fix": 'add_header Content-Security-Policy "default-src \'self\'";'
    },
    "X-Frame-Options": {
        "description": "Prevents clickjacking attacks",
        "fix": 'add_header X-Frame-Options "DENY";'
    },
    "Strict-Transport-Security": {
        "description": "Forces HTTPS connections",
        "fix": 'add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";'
    },
    "X-Content-Type-Options": {
        "description": "Prevents MIME type sniffing",
        "fix": 'add_header X-Content-Type-Options "nosniff";'
    },
    "Referrer-Policy": {
        "description": "Controls referrer information sent with requests",
        "fix": 'add_header Referrer-Policy "no-referrer-when-downgrade";'
    },
}


def check_headers(url: str) -> dict:
    """
    Fetch and analyze HTTP security headers for a given URL.
    Returns score, passed checks, failed checks with fix suggestions.
    """
    result = {
        "score"       : 0,
        "passed"      : [],
        "failed"      : [],
        "raw_headers" : {},
        "error"       : None
    }

    try:
        response = requests.get(url, timeout=10, allow_redirects=True)
        headers  = response.headers
        result["raw_headers"] = dict(headers)

        for header, meta in SECURITY_HEADERS.items():
            if header in headers:
                result["passed"].append({
                    "name"        : header,
                    "value"       : headers[header],
                    "description" : meta["description"],
                    "status"      : "pass"
                })
                result["score"] += 10
            else:
                result["failed"].append({
                    "name"        : header,
                    "value"       : "Missing",
                    "description" : meta["description"],
                    "fix"         : meta["fix"],
                    "status"      : "fail"
                })
                result["score"] -= 10

    except requests.exceptions.Timeout:
        result["error"] = "Connection timed out"
    except requests.exceptions.ConnectionError:
        result["error"] = "Could not connect to host"
    except Exception as e:
        result["error"] = str(e)

    return result
