import { z } from 'zod'

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(150, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
})

export const updateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(150, 'Name too long').optional(),
  description: z.string().max(500, 'Description too long').optional(),
})

export const addMemberSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
})
