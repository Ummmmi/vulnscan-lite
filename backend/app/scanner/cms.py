import requests
import re
from bs4 import BeautifulSoup

CMS_SIGNATURES = {
    "WordPress": {
        "meta_generator": "wordpress",
        "headers": ["x-powered-by"],
        "html_patterns": ["/wp-content/", "/wp-includes/"],
        "latest_version": "6.7.2"
    },
    "Drupal": {
        "meta_generator": "drupal",
        "headers": ["x-generator"],
        "html_patterns": ["/sites/default/files/", "drupal.js"],
        "latest_version": "10.3.1"
    },
    "Joomla": {
        "meta_generator": "joomla",
        "headers": [],
        "html_patterns": ["/components/com_", "/media/jui/"],
        "latest_version": "5.2.0"
    },
    "Wix": {
        "meta_generator": "wix",
        "headers": ["x-wix-request-id"],
        "html_patterns": ["wixstatic.com", "wix-bolt"],
        "latest_version": "N/A"
    },
    "Shopify": {
        "meta_generator": "shopify",
        "headers": ["x-shopify-stage"],
        "html_patterns": ["cdn.shopify.com", "shopify.com/s/"],
        "latest_version": "N/A"
    }
}


def check_cms(url: str) -> dict:
    result = {
        "detected"        : False,
        "name"            : None,
        "version"         : None,
        "latest_version"  : None,
        "outdated"        : False,
        "detection_method": None,
        "error"           : None
    }

    try:
        response = requests.get(url, timeout=10, allow_redirects=True)
        html     = response.text
        headers  = {k.lower(): v for k, v in response.headers.items()}
        soup     = BeautifulSoup(html, 'html.parser')

        for cms_name, signatures in CMS_SIGNATURES.items():

            # Method 1: meta generator tag
            meta = soup.find('meta', attrs={'name': 'generator'})
            if meta and signatures["meta_generator"] in meta.get('content', '').lower():
                version = _extract_version(meta.get('content', ''))
                result.update({
                    "detected"        : True,
                    "name"            : cms_name,
                    "version"         : version,
                    "latest_version"  : signatures["latest_version"],
                    "outdated"        : _is_outdated(version, signatures["latest_version"]),
                    "detection_method": "meta generator tag"
                })
                return result

            # Method 2: HTTP headers
            for header in signatures["headers"]:
                if header in headers:
                    result.update({
                        "detected"        : True,
                        "name"            : cms_name,
                        "version"         : headers[header],
                        "latest_version"  : signatures["latest_version"],
                        "outdated"        : False,
                        "detection_method": f"HTTP header: {header}"
                    })
                    return result

            # Method 3: HTML patterns
            for pattern in signatures["html_patterns"]:
                if pattern in html:
                    result.update({
                        "detected"        : True,
                        "name"            : cms_name,
                        "version"         : "Unknown",
                        "latest_version"  : signatures["latest_version"],
                        "outdated"        : False,
                        "detection_method": "HTML pattern match"
                    })
                    return result

    except Exception as e:
        result["error"] = str(e)

    return result


def _extract_version(generator_content: str) -> str:
    match = re.search(r'(\d+\.\d+[\.\d]*)', generator_content)
    return match.group(1) if match else "Unknown"


def _is_outdated(version: str, latest: str) -> bool:
    if not version or version == "Unknown" or latest == "N/A":
        return False
    try:
        current = [int(x) for x in version.split('.')]
        newest  = [int(x) for x in latest.split('.')]
        return current < newest
    except:
        return False
