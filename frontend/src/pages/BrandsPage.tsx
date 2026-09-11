import { ResourceManager } from '../components/common/ResourceManager'
import { brandsApi } from '../api/endpoints/brands.api'
import { useAuth } from '../contexts/AuthContext'

export const BrandsPage = () => { const { user } = useAuth(); return <ResourceManager title="Brands" description="Keep brand identity consistent across your catalog." resourceName="Brand" queryKey="brands" fields={[{ key: 'name', label: 'Name', required: true, placeholder: 'e.g. Samsung' }]} list={() => brandsApi.getAll()} create={brandsApi.create} update={brandsApi.update} remove={brandsApi.delete} canManage={user?.role === 'ADMIN'} /> }
