import { ResourceManager } from '../components/common/ResourceManager'
import { categoriesApi } from '../api/endpoints/categories.api'

export const CategoriesPage = () => <ResourceManager title="Categories" description="Organize products into clean, reportable groups." resourceName="Category" queryKey="categories" fields={[{ key: 'name', label: 'Name', required: true, placeholder: 'e.g. Smartphones' }, { key: 'description', label: 'Description', placeholder: 'What belongs in this category?' }]} list={() => categoriesApi.getAll()} create={categoriesApi.create} update={categoriesApi.update} remove={categoriesApi.delete} />
