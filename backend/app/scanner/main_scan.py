from .headers import check_headers
from .ssl_check import check_ssl
from .cms import check_cms


def run_full_scan(url: str) -> dict:
    """
    Run complete security scan on given URL.
    Combines headers + SSL + CMS results into final score and grade.
    """

    if not url.startswith("http"):
        url = "https://" + url

    print(f"[*] Starting scan: {url}")

    # Run all modules
    headers_result = check_headers(url)
    ssl_result     = check_ssl(url)
    cms_result     = check_cms(url)

    # Base score: 50 + header points
    raw_score  = 50 + headers_result.get("score", 0)
    base_score = max(0, min(100, raw_score))

    # SSL bonus
    ssl_bonus = {
        "A+": 20, "A": 15, "B": 10, "F": 0
    }.get(ssl_result.get("grade", "F"), 0)

    # CMS penalty — outdated CMS = -10
    cms_penalty = -10 if cms_result.get("outdated") else 0

    final_score = min(100, max(0, base_score + ssl_bonus + cms_penalty))
    grade       = _score_to_grade(final_score)

    print(f"[✓] Done — Score: {final_score} | Grade: {grade}")

    return {
        "url"    : url,
        "score"  : final_score,
        "grade"  : grade,
        "headers": headers_result,
        "ssl"    : ssl_result,
        "cms"    : cms_result,
    }


def _score_to_grade(score: int) -> str:
    if score >= 90: return "A+"
    if score >= 80: return "A"
    if score >= 70: return "B+"
    if score >= 60: return "B"
    if score >= 50: return "C"
    return "F"
