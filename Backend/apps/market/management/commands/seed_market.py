"""
python manage.py seed_market
Seeds demo instruments and price snapshots.
"""
from decimal import Decimal
from django.core.management.base import BaseCommand
from apps.market.models import Instrument, PriceSnapshot


STOCKS = [
    ("RELIANCE", "Reliance Industries", "NSE", "Energy", 1800000),
    ("TCS", "Tata Consultancy Services", "NSE", "IT", 1400000),
    ("HDFCBANK", "HDFC Bank", "NSE", "Banking", 1100000),
    ("INFY", "Infosys", "NSE", "IT", 700000),
    ("ICICIBANK", "ICICI Bank", "NSE", "Banking", 650000),
    ("SBIN", "State Bank of India", "NSE", "Banking", 550000),
    ("BHARTIARTL", "Bharti Airtel", "NSE", "Telecom", 500000),
    ("ITC", "ITC Limited", "NSE", "FMCG", 480000),
    ("WIPRO", "Wipro", "NSE", "IT", 250000),
    ("TATAMOTORS", "Tata Motors", "NSE", "Automobile", 220000),
]

STOCK_PRICES = {
    "RELIANCE": (2450.50, 2430, 2470, 2420, 2445, 2440, 8500000, 10.50, 0.43),
    "TCS": (3820.00, 3800, 3850, 3790, 3815, 3810, 3200000, 10.00, 0.26),
    "HDFCBANK": (1625.75, 1610, 1640, 1605, 1620, 1615, 6100000, 10.75, 0.67),
    "INFY": (1520.30, 1510, 1535, 1505, 1525, 1518, 4800000, 2.30, 0.15),
    "ICICIBANK": (1085.20, 1070, 1095, 1065, 1080, 1075, 5500000, 10.20, 0.95),
    "SBIN": (628.50, 620, 635, 618, 625, 622, 12000000, 6.50, 1.05),
    "BHARTIARTL": (1150.80, 1140, 1160, 1135, 1148, 1145, 3800000, 5.80, 0.51),
    "ITC": (438.25, 432, 442, 430, 436, 434, 9500000, 4.25, 0.98),
    "WIPRO": (465.80, 460, 470, 458, 463, 462, 5600000, 3.80, 0.82),
    "TATAMOTORS": (685.30, 675, 695, 670, 680, 678, 7800000, 7.30, 1.08),
}

CRYPTOS = [
    ("BTC", "Bitcoin", "BINANCE"),
    ("ETH", "Ethereum", "BINANCE"),
    ("SOL", "Solana", "BINANCE"),
    ("XRP", "Ripple", "BINANCE"),
    ("DOGE", "Dogecoin", "BINANCE"),
]

CRYPTO_PRICES = {
    "BTC": (5200000, 5150000, 5250000, 5100000, 5190000, 5180000, 45000, 20000, 0.39),
    "ETH": (285000, 282000, 288000, 280000, 284000, 283000, 320000, 2000, 0.71),
    "SOL": (12500, 12300, 12700, 12200, 12450, 12400, 1500000, 100, 0.81),
    "XRP": (45.50, 44.80, 46.20, 44.50, 45.30, 45.10, 8000000, 0.40, 0.89),
    "DOGE": (13.50, 13.20, 13.80, 13.10, 13.40, 13.30, 12000000, 0.20, 1.50),
}


class Command(BaseCommand):
    help = "Seed demo instruments and prices."

    def handle(self, *args, **options):
        # Seed stocks
        for symbol, name, exchange, sector, mcap in STOCKS:
            inst, created = Instrument.objects.get_or_create(
                symbol=symbol, exchange=exchange,
                defaults={
                    "name": name, "asset_type": "stock",
                    "sector": sector, "market_cap": mcap,
                },
            )
            if created and symbol in STOCK_PRICES:
                p = STOCK_PRICES[symbol]
                PriceSnapshot.objects.create(
                    instrument=inst, ltp=p[0], open_price=p[1],
                    high=p[2], low=p[3], close=p[4], prev_close=p[5],
                    volume=p[6], change=p[7], change_pct=p[8],
                )
                self.stdout.write(f"  + {symbol}")

        # Seed crypto
        for symbol, name, exchange in CRYPTOS:
            inst, created = Instrument.objects.get_or_create(
                symbol=symbol, exchange=exchange,
                defaults={"name": name, "asset_type": "crypto"},
            )
            if created and symbol in CRYPTO_PRICES:
                p = CRYPTO_PRICES[symbol]
                PriceSnapshot.objects.create(
                    instrument=inst, ltp=p[0], open_price=p[1],
                    high=p[2], low=p[3], close=p[4], prev_close=p[5],
                    volume=p[6], change=p[7], change_pct=p[8],
                )
                self.stdout.write(f"  + {symbol}")

        self.stdout.write(self.style.SUCCESS("Market seeding complete!"))