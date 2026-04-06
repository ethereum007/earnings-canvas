INSERT INTO public.companies (symbol, name, sector, screener_slug, market_cap)
VALUES ('GODREJCP', 'Godrej Consumer Products Ltd', 'FMCG', 'GODREJCP', 'Large Cap')
ON CONFLICT DO NOTHING;