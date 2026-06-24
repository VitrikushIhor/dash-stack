/* eslint-disable */
export default async () => {
  const t = {
    ['./task/presentation/dto/create-task.dto']:
      await import('./task/presentation/dto/create-task.dto'),
    ['./task/domain/enums/task-status.enum']:
      await import('./task/domain/enums/task-status.enum'),
    ['./storage/dto/upload-response.dto']:
      await import('./storage/dto/upload-response.dto'),
  };
  return {
    '@nestjs/swagger/plugin': {
      models: [
        [
          import('./auth/dto/verify-email.dto'),
          { VerifyEmailDto: { token: { required: true, type: () => String } } },
        ],
        [
          import('./auth/dto/forgot-password.dto'),
          {
            ForgotPasswordDto: {
              email: { required: true, type: () => String, format: 'email' },
            },
          },
        ],
        [
          import('./auth/dto/reset-password.dto'),
          {
            ResetPasswordDto: {
              token: { required: true, type: () => String },
              password: { required: true, type: () => String, minLength: 8 },
            },
          },
        ],
        [
          import('./auth/dto/logout.dto'),
          {
            LogoutDto: { refreshToken: { required: true, type: () => String } },
          },
        ],
        [
          import('./auth/dto/oauth-exchange.dto'),
          {
            OAuthExchangeDto: { token: { required: true, type: () => String } },
          },
        ],
        [
          import('./organization/presentation/dto/create-organization.dto'),
          {
            CreateOrganizationDto: {
              name: {
                required: true,
                type: () => String,
                minLength: 2,
                maxLength: 50,
              },
              description: {
                required: false,
                type: () => String,
                maxLength: 200,
              },
            },
          },
        ],
        [
          import('./organization/presentation/dto/update-organization.dto'),
          {
            UpdateOrganizationDto: {
              logo: { required: false, type: () => String, format: 'uri' },
            },
          },
        ],
        [
          import('./invitation/presentation/dto/create-invitation.dto'),
          {
            CreateInvitationDto: {
              email: { required: true, type: () => String, format: 'email' },
              role: { required: true, type: () => Object },
            },
          },
        ],
        [
          import('./task/presentation/dto/create-task.dto'),
          {
            CreateTaskLabelDto: {
              name: { required: true, type: () => String },
              color: { required: true, type: () => String },
            },
            CreateChecklistItemDto: {
              title: { required: true, type: () => String },
              completed: { required: false, type: () => Boolean },
            },
            CreateChecklistDto: {
              name: { required: true, type: () => String },
              items: {
                required: true,
                type: () => [
                  t['./task/presentation/dto/create-task.dto']
                    .CreateChecklistItemDto,
                ],
              },
            },
            CreateTaskDto: {
              title: { required: true, type: () => String },
              description: { required: false, type: () => String },
              status: {
                required: false,
                enum: t['./task/domain/enums/task-status.enum'].TaskStatus,
              },
              startDate: { required: false, type: () => String },
              dueDate: { required: false, type: () => String },
              attachments: { required: false, type: () => [String] },
              assigneeIds: { required: false, type: () => [String] },
              label: {
                required: true,
                type: () =>
                  t['./task/presentation/dto/create-task.dto']
                    .CreateTaskLabelDto,
              },
              checklists: {
                required: false,
                type: () => [
                  t['./task/presentation/dto/create-task.dto']
                    .CreateChecklistDto,
                ],
              },
            },
          },
        ],
        [
          import('./task/presentation/dto/find-all-tasks.dto'),
          {
            FindAllTasksDto: {
              search: { required: false, type: () => String },
              status: {
                required: false,
                enum: t['./task/domain/enums/task-status.enum'].TaskStatus,
                isArray: true,
              },
              assigneeIds: { required: false, type: () => [String] },
              labelNames: { required: false, type: () => [String] },
              dueDateFrom: { required: false, type: () => Date },
              dueDateTo: { required: false, type: () => Date },
              startDateFrom: { required: false, type: () => Date },
              startDateTo: { required: false, type: () => Date },
            },
          },
        ],
        [
          import('./task/presentation/dto/bulk-action.dto'),
          {
            BulkUpdateTasksDto: {
              ids: { required: true, type: () => [String], minItems: 1 },
              status: {
                required: true,
                enum: t['./task/domain/enums/task-status.enum'].TaskStatus,
              },
            },
            BulkDeleteTasksDto: {
              ids: { required: true, type: () => [String], minItems: 1 },
            },
          },
        ],
        [
          import('./task/presentation/dto/update-task.dto'),
          {
            UpdateTaskDto: {
              startDate: {
                required: false,
                type: () => String,
                nullable: true,
              },
              dueDate: { required: false, type: () => String, nullable: true },
            },
          },
        ],
        [
          import('./storage/dto/upload-response.dto'),
          {
            UploadResponseDto: {
              key: { required: true, type: () => String },
              url: { required: true, type: () => String },
              size: { required: true, type: () => Number },
              mimeType: { required: true, type: () => String },
            },
          },
        ],
        [
          import('./common/pagination/pagination.dto'),
          {
            PaginationDto: {
              page: {
                required: false,
                type: () => Number,
                default: 1,
                minimum: 1,
              },
              perPage: {
                required: false,
                type: () => Number,
                default: 10,
                minimum: 1,
                maximum: 100,
              },
            },
          },
        ],
      ],
      controllers: [
        [
          import('./app.controller'),
          {
            AppController: {
              getHello: { type: String },
              helloWorld: { type: String },
            },
          },
        ],
        [
          import('./health/health.controller'),
          { HealthController: { check: { type: Object } } },
        ],
        [
          import('./auth/auth.controller'),
          {
            AuthController: {
              signup: {},
              verifyEmail: { type: Object },
              login: { type: Object },
              refreshToken: {},
              logout: {},
              logoutAll: {},
              forgotPassword: {},
              resetPassword: {},
              me: { type: Object },
              oauthExchange: { type: Object },
            },
          },
        ],
        [
          import('./organization/presentation/organization.controller'),
          {
            OrganizationController: {
              create: { type: Object },
              findAllForUser: { type: [Object] },
              findById: { type: Object },
              update: { type: Object },
              delete: {},
              findMembers: { type: [Object] },
              findMember: { type: Object },
            },
          },
        ],
        [
          import('./invitation/presentation/controllers/invitation.controller'),
          {
            InvitationController: {
              sendInvite: { type: Object },
              listPending: { type: [Object] },
              revokeInvite: {},
            },
          },
        ],
        [
          import('./invitation/presentation/controllers/invitation-accept.controller'),
          { InvitationAcceptController: { acceptInvite: { type: Object } } },
        ],
        [
          import('./task/presentation/task.controller'),
          {
            TaskController: {
              create: { type: Object },
              findAll: { type: [Object] },
              updateMany: {},
              deleteMany: {},
              findById: { type: Object },
              update: { type: Object },
              delete: {},
            },
          },
        ],
        [
          import('./storage/storage.controller'),
          {
            StorageController: {
              uploadImage: {
                type: t['./storage/dto/upload-response.dto'].UploadResponseDto,
              },
              uploadFile: {
                type: t['./storage/dto/upload-response.dto'].UploadResponseDto,
              },
            },
          },
        ],
      ],
    },
  };
};
