INSERT INTO public.companies (symbol, name, sector, screener_slug, market_cap)
VALUES ('M&M', 'Mahindra & Mahindra Ltd', 'Automobiles', 'M&M', 'Large Cap')
ON CONFLICT DO NOTHING;