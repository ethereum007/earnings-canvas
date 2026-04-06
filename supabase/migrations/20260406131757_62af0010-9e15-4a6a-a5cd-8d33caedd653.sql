INSERT INTO public.companies (symbol, name, sector, screener_slug, market_cap)
VALUES ('IDFCFIRSTB', 'IDFC First Bank Ltd', 'Banking', 'IDFCFIRSTB', 'Mid Cap')
ON CONFLICT DO NOTHING;