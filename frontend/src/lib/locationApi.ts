const LOCATION_API_URL = "https://provinces.open-api.vn/api/v1";

export type AdministrativeUnit = {
  code: number;
  name: string;
  division_type?: string;
};

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${LOCATION_API_URL}${path}`);
  if (!response.ok) {
    throw new Error("Không thể tải dữ liệu địa giới hành chính.");
  }

  return response.json() as Promise<T>;
}

export const locationApi = {
  provinces: () => getJson<AdministrativeUnit[]>("/p/"),
  async districts(provinceCode: number) {
    const province = await getJson<{ districts: AdministrativeUnit[] }>(`/p/${provinceCode}?depth=2`);
    return province.districts;
  },
  async wards(districtCode: number) {
    const district = await getJson<{ wards: AdministrativeUnit[] }>(`/d/${districtCode}?depth=2`);
    return district.wards;
  },
};
