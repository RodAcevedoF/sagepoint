import type {
  IAdminRepository,
  AdminUserView,
} from '../../domain/outbound/admin.repository.port';

export class ListUsersUseCase {
  constructor(private readonly adminRepository: IAdminRepository) {}

  async execute(): Promise<AdminUserView[]> {
    return this.adminRepository.findAllUsers();
  }
}
