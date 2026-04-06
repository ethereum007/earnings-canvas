INSERT INTO public.companies (symbol, name, sector, screener_slug, market_cap)
VALUES ('CIEINDIA', 'CIE Automotive India Ltd', 'Auto Components', 'CIEINDIA', 'Mid Cap')
ON CONFLICT DO NOTHING;