import { LabelReadModel } from '../read-models/label.read-model';

export interface CreateLabelData {
  organizationId: string;
  name: string;
  color: string;
}

export interface UpdateLabelData {
  name?: string;
  color?: string;
}

export interface LabelRepositoryPort {
  create(data: CreateLabelData): Promise<LabelReadModel>;
  findAll(organizationId: string): Promise<LabelReadModel[]>;
  findById(id: string, organizationId: string): Promise<LabelReadModel | null>;
  findByName(name: string, organizationId: string): Promise<LabelReadModel | null>;
  update(id: string, organizationId: string, data: UpdateLabelData): Promise<LabelReadModel>;
  delete(id: string, organizationId: string): Promise<void>;
}
