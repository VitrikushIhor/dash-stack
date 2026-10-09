import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { PrismaService } from 'nestjs-prisma';
import { TaskFileStorageAdapter } from '../../../task/infrastructure/storage/task-file-storage.adapter';
import { StorageModule } from '../../storage.module';

@Global()
@Module({
  providers: [
    { provide: ConfigService, useValue: { get: () => 'local' } },
    { provide: PrismaService, useValue: {} },
  ],
  exports: [ConfigService, PrismaService],
})
class TestDependenciesModule {}

describe('StorageModule dependency boundary', () => {
  it('should_resolve_task_file_storage_adapter_when_storage_module_is_imported', async () => {
    const module = await Test.createTestingModule({
      imports: [TestDependenciesModule, StorageModule],
      providers: [TaskFileStorageAdapter],
    }).compile();

    expect(module.get(TaskFileStorageAdapter)).toBeInstanceOf(TaskFileStorageAdapter);
    await module.close();
  });
});
