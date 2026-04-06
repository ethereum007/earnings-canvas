INSERT INTO public.companies (symbol, name, sector, screener_slug, market_cap)
VALUES ('STARHEALTH', 'Star Health & Allied Insurance Company Ltd', 'Insurance', 'STARHEALTH', 'Mid Cap')
ON CONFLICT DO NOTHING;