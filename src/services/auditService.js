import { makeService } from './api'
import { db } from '../data/db'

export const auditService = makeService({
  data: db.audit,
  searchFields: ['actor', 'action', 'module', 'resource', 'ip'],
  defaultSort: 'ts',
  defaultDir: 'desc',
})