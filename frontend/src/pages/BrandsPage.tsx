import { ResourceManager } from '../components/common/ResourceManager'
import { brandsApi } from '../api/endpoints/brands.api'

export const BrandsPage = () => <ResourceManager title="Brands" description="Keep brand identity consistent across your catalog." resourceName="Brand" queryKey="brands" fields={[{ key: 'name', label: 'Name', required: true, placeholder: 'e.g. Samsung' }]} list={() => brandsApi.getAll()} create={brandsApi.create} update={brandsApi.update} remove={brandsApi.delete} />
