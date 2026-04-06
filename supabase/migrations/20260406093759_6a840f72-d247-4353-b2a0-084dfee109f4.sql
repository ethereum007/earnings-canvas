INSERT INTO public.companies (symbol, name, sector, screener_slug, market_cap)
VALUES ('ICICIBANK', 'ICICI Bank Ltd', 'Financial Services', 'ICICIBANK', 'Large Cap')
ON CONFLICT DO NOTHING;