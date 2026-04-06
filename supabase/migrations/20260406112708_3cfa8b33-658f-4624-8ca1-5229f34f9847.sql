INSERT INTO public.companies (symbol, name, sector, screener_slug, market_cap)
VALUES ('HCLTECH', 'HCL Technologies Ltd', 'Information Technology', 'HCLTECH/consolidated', 'Large Cap')
ON CONFLICT DO NOTHING;