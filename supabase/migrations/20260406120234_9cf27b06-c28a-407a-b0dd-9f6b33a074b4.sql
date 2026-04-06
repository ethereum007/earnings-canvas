INSERT INTO public.companies (symbol, name, sector, screener_slug, market_cap)
VALUES ('ATGL', 'Adani Total Gas Ltd', 'Gas Distribution', 'ATGL', 'Large Cap')
ON CONFLICT DO NOTHING;