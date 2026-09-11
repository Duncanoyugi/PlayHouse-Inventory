import { ResourceManager } from '../components/common/ResourceManager'
import { locationsApi } from '../api/endpoints/locations.api'
import { useAuth } from '../contexts/AuthContext'

export const LocationsPage = () => {
  const { user } = useAuth()
  return <ResourceManager title="Locations" description="Manage the places where PlayHouse stock is stored and received." resourceName="Location" queryKey="locations" fields={[{ key: 'name', label: 'Name', required: true, placeholder: 'e.g. Nairobi Warehouse' }]} list={() => locationsApi.getAll()} create={locationsApi.create} update={locationsApi.update} remove={locationsApi.delete} canManage={user?.role === 'ADMIN'} />
}
