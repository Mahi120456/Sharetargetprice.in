import os
import requests
from datetime import datetime, date
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

supabase: Client = create_client(
    os.getenv("NEXT_PUBLIC_SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_KEY")
)

INDIAN_API_KEY = os.getenv("INDIAN_API_KEY")

def slugify(name):
    return name.lower().replace(" ", "-").replace(".", "")

def fetch_nse_ipos():
    """Get IPO calendar from NSE API"""
    url = "https://www.nseindia.com/api/ipo-issue"
    headers = {"User-Agent": "Mozilla/5.0"}
    session = requests.Session()
    session.get("https://www.nseindia.com", headers=headers)
    resp = session.get(url, headers=headers)
    if resp.status_code == 200:
        return resp.json()
    return []

def fetch_indianapi_ipo_details(symbol):
    """Get GMP, subscription, analyst rating from IndianAPI (free)"""
    if not INDIAN_API_KEY:
        return {}
    url = f"https://indianapi.in/stockmarket/ipos/{symbol}?api_key={INDIAN_API_KEY}"
    try:
        resp = requests.get(url, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            return {
                "gmp": data.get("gmp"),
                "subscription_retail": data.get("subscription_retail"),
                "subscription_qib": data.get("subscription_qib"),
                "subscription_nii": data.get("subscription_nii"),
                "subscription_total": data.get("subscription_total"),
                "analyst_rating": data.get("analyst_rating"),
                "strengths": data.get("strengths"),
                "risks": data.get("risks"),
                "financial_overview": data.get("financial_overview"),
                "company_profile": data.get("company_profile"),
            }
    except:
        pass
    return {}

def main():
    # Fetch from NSE
    nse_ipos = fetch_nse_ipos()
    for item in nse_ipos:
        company = item.get("symbol")
        if not company:
            continue
        data = {
            "company_name": company,
            "slug": slugify(company),
            "open_date": datetime.strptime(item["openDate"], "%d-%b-%Y").date() if item.get("openDate") else None,
            "close_date": datetime.strptime(item["closeDate"], "%d-%b-%Y").date() if item.get("closeDate") else None,
            "listing_date": datetime.strptime(item["listingDate"], "%d-%b-%Y").date() if item.get("listingDate") else None,
            "price_band": f"{item.get('priceBandLower')}-{item.get('priceBandUpper')}" if item.get('priceBandLower') else None,
            "issue_size": item.get("issueSize"),
            "lot_size": item.get("lotSize"),
        }
        # Determine status
        today = date.today()
        if data["open_date"] and data["open_date"] <= today and data["close_date"] and data["close_date"] >= today:
            data["status"] = "current"
        elif data["close_date"] and data["close_date"] < today:
            data["status"] = "closed"
        else:
            data["status"] = "upcoming"
        if data["listing_date"] and data["listing_date"] <= today:
            data["status"] = "listed"
        # Fetch additional details from IndianAPI
        api_details = fetch_indianapi_ipo_details(company)
        data.update(api_details)
        # Upsert
        supabase.table("ipos").upsert(data, on_conflict="slug").execute()

    # Update current price for listed IPOs (optional, using nsefast)
    listed = supabase.table("ipos").select("*").eq("status", "listed").execute()
    for ipo in listed.data:
        sym = ipo["company_name"].split(" ")[0]
        try:
            import nsefast as nse
            quote = nse.fetch_quote(sym)
            price = quote.get("lastPrice") or quote.get("ltp")
            if price:
                supabase.table("ipos").update({"current_price": price}).eq("slug", ipo["slug"]).execute()
        except:
            pass

if __name__ == "__main__":
    main()
