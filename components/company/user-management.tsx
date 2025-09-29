'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { 
  UserPlus, 
  MoreHorizontal, 
  Mail, 
  Shield, 
  Trash2, 
  // Calendar,
  Clock,
  Crown,
  User,
  Eye,
  ShoppingCart,
  Settings
} from 'lucide-react'
import { CompanyRole } from '@prisma/client'

interface User {
  id: string
  name: string | null
  email: string
  firstName: string | null
  lastName: string | null
  jobTitle: string | null
  department: string | null
  companyRole: CompanyRole | null
  isActive: boolean
  lastLoginAt: Date | null
  createdAt: Date
  invitedBy: string | null
  invitedAt: Date | null
  acceptedAt: Date | null
}

interface UserManagementProps {
  companyId: string
  currentUserRole: CompanyRole
  onRefresh: () => void
}

const roleColors = {
  [CompanyRole.OWNER]: 'bg-purple-100 text-purple-800',
  [CompanyRole.ADMIN]: 'bg-blue-100 text-blue-800',
  [CompanyRole.MANAGER]: 'bg-green-100 text-green-800',
  [CompanyRole.PURCHASER]: 'bg-yellow-100 text-yellow-800',
  [CompanyRole.VIEWER]: 'bg-gray-100 text-gray-800',
}

const roleIcons = {
  [CompanyRole.OWNER]: Crown,
  [CompanyRole.ADMIN]: Shield,
  [CompanyRole.MANAGER]: Settings,
  [CompanyRole.PURCHASER]: ShoppingCart,
  [CompanyRole.VIEWER]: Eye,
}

export function UserManagement({ companyId, currentUserRole, onRefresh }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [inviteForm, setInviteForm] = useState<{
    email: string
    role: CompanyRole
    message: string
  }>({
    email: '',
    role: CompanyRole.VIEWER,
    message: '',
  })
  const [inviteLoading, setInviteLoading] = useState(false)

  const canManageUsers = [CompanyRole.OWNER, CompanyRole.ADMIN, CompanyRole.MANAGER].includes(currentUserRole as any)
  const canInviteUsers = [CompanyRole.OWNER, CompanyRole.ADMIN, CompanyRole.MANAGER].includes(currentUserRole as any)

  useEffect(() => {
    fetchUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId])

  const fetchUsers = async () => {
    try {
      const response = await fetch(`/api/companies/${companyId}/users`)
      if (!response.ok) throw new Error('Failed to fetch users')
      
      const data = await response.json()
      setUsers(data.users)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInviteUser = async () => {
    if (!inviteForm.email || !inviteForm.role) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    setInviteLoading(true)
    try {
      const response = await fetch(`/api/companies/${companyId}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'invite',
          ...inviteForm,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send invitation')
      }

      toast({
        title: 'Success',
        description: 'Invitation sent successfully',
      })

      setInviteDialogOpen(false)
      setInviteForm({ email: '', role: CompanyRole.VIEWER, message: '' })
      onRefresh()
    } catch (error) {
      console.error('Error inviting user:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send invitation',
        variant: 'destructive',
      })
    } finally {
      setInviteLoading(false)
    }
  }

  const handleUpdateRole = async (userId: string, newRole: CompanyRole) => {
    try {
      const response = await fetch(`/api/companies/${companyId}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateRole',
          userId,
          role: newRole,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update role')
      }

      toast({
        title: 'Success',
        description: 'User role updated successfully',
      })

      fetchUsers()
    } catch (error) {
      console.error('Error updating role:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update role',
        variant: 'destructive',
      })
    }
  }

  const handleRemoveUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/companies/${companyId}/users`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to remove user')
      }

      toast({
        title: 'Success',
        description: 'User removed successfully',
      })

      fetchUsers()
    } catch (error) {
      console.error('Error removing user:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to remove user',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Team Members ({users.length})</CardTitle>
          {canInviteUsers && (
            <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invite User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Team Member</DialogTitle>
                  <DialogDescription>
                    Send an invitation to join your company
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="user@example.com"
                      value={inviteForm.email}
                      onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="role">Role *</Label>
                    <Select 
                      value={inviteForm.role} 
                      onValueChange={(value: string) => setInviteForm({ ...inviteForm, role: value as CompanyRole })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={CompanyRole.VIEWER}>Viewer - Can view products and orders</SelectItem>
                        <SelectItem value={CompanyRole.PURCHASER}>Purchaser - Can place orders</SelectItem>
                        <SelectItem value={CompanyRole.MANAGER}>Manager - Can manage team and place orders</SelectItem>
                        {currentUserRole === CompanyRole.OWNER && (
                          <SelectItem value={CompanyRole.ADMIN}>Admin - Can manage company settings</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="message">Message (Optional)</Label>
                    <Textarea
                      id="message"
                      placeholder="Welcome to our team!"
                      value={inviteForm.message}
                      onChange={(e) => setInviteForm({ ...inviteForm, message: e.target.value })}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={handleInviteUser} disabled={inviteLoading}>
                      {inviteLoading ? 'Sending...' : 'Send Invitation'}
                    </Button>
                    <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const RoleIcon = user.companyRole ? roleIcons[user.companyRole] : User
              
              return (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">
                        {user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unnamed User'}
                      </div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                      {user.jobTitle && (
                        <div className="text-xs text-muted-foreground">{user.jobTitle}</div>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {user.companyRole && (
                      <Badge className={roleColors[user.companyRole]}>
                        <RoleIcon className="mr-1 h-3 w-3" />
                        {user.companyRole}
                      </Badge>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant={user.isActive ? 'default' : 'secondary'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm">
                      {user.lastLoginAt ? (
                        <div className="flex items-center">
                          <Clock className="mr-1 h-3 w-3" />
                          {new Date(user.lastLoginAt).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Never</span>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {canManageUsers && user.companyRole !== CompanyRole.OWNER && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem onClick={() => window.open(`mailto:${user.email}`)}>
                            <Mail className="mr-2 h-4 w-4" />
                            Send Email
                          </DropdownMenuItem>
                          
                          {user.companyRole && (user.companyRole as any) !== CompanyRole.OWNER && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                              {Object.values(CompanyRole)
                                .filter(role => role !== CompanyRole.OWNER && role !== user.companyRole)
                                .map(role => (
                                  <DropdownMenuItem 
                                    key={role}
                                    onClick={() => handleUpdateRole(user.id, role)}
                                  >
                                    <Shield className="mr-2 h-4 w-4" />
                                    {role}
                                  </DropdownMenuItem>
                                ))}
                            </>
                          )}
                          
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove User
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove {user.name || user.email} from the company? 
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleRemoveUser(user.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        
        {users.length === 0 && (
          <div className="text-center py-8">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No team members</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by inviting your first team member.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
