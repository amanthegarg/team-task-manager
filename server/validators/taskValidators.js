import { z } from 'zod'

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be 100 characters or less'),
  description: z.string().max(1000, 'Description too long').optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional().default('TODO'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional().default('MEDIUM'),
  dueDate: z
    .string()
    .optional()
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      { message: 'Invalid date format' }
    )
    .refine(
      (val) => !val || new Date(val) > new Date(),
      { message: 'Due date must be in the future' }
    ),
  projectId: z.string().uuid('Invalid project ID'),
  assignedTo: z.string().uuid('Invalid user ID').optional().nullable(),
})

export const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long').optional(),
  description: z.string().max(1000, 'Description too long').optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  dueDate: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      { message: 'Invalid date format' }
    ),
  projectId: z.string().uuid('Invalid project ID').optional(),
  assignedTo: z.string().uuid('Invalid user ID').optional().nullable(),
})

export const updateStatusSchema = z.object({
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE'], {
    errorMap: () => ({ message: 'Status must be one of: TODO, IN_PROGRESS, DONE' }),
  }),
})
