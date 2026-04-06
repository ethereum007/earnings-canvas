INSERT INTO public.companies (symbol, name, sector, screener_slug, market_cap)
VALUES ('CAMS', 'Computer Age Management Services Ltd', 'Financial Services', 'CAMS', 'Mid Cap')
ON CONFLICT DO NOTHING;