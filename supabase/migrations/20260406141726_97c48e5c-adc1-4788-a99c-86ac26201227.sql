INSERT INTO public.companies (symbol, name, sector, screener_slug, market_cap)
VALUES ('COFORGE', 'Coforge Ltd', 'IT Services', 'COFORGE', 'Mid Cap')
ON CONFLICT DO NOTHING;