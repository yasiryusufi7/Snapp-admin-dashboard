import { request } from './api'
import { CURRENT_ADMIN, ROLES } from '../data/roles'

export const authService = {
  getUser() {
    return request(() => CURRENT_ADMIN, 200)
  },

  getRoles() {
    return request(() => ROLES, 200)
  },

  /** Simulates a role switch used by the demo profile menu. */
  switchRole(roleId) {
    return request(
      () => ({ ...CURRENT_ADMIN, roleId, roleLabel: ROLES.find((r) => r.id === roleId)?.label }),
      260,
    )
  },

  login(email, password) {
    return request(
      () => {
        if (!email || !password) throw new Error('Email and password are required.')
        return { token: 'demo.jwt.token', user: CURRENT_ADMIN }
      },
      600,
    )
  },
}