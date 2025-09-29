'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
// import { Alert, AlertDescription } from '@/components/ui/alert'
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  // Calendar,
  // Clock,
  Image as ImageIcon,
  Link as LinkIcon,
  MoreHorizontal,
  // Upload,
  Play,
  // Pause,
  RotateCcw
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Banner {
  id: string
  title: string
  description?: string
  imageUrl: string
  linkUrl?: string
  linkText?: string
  position: 'hero' | 'secondary' | 'sidebar' | 'footer'
  isActive: boolean
  startDate?: Date
  endDate?: Date
  displayOrder: number
  clickCount: number
  impressions: number
  createdAt: Date
  updatedAt: Date
}

interface BannerFormData {
  title: string
  description: string
  imageUrl: string
  linkUrl: string
  linkText: string
  position: 'hero' | 'secondary' | 'sidebar' | 'footer'
  isActive: boolean
  startDate: string
  endDate: string
  displayOrder: number
}

const BANNER_POSITIONS = [
  { value: 'hero', label: 'Hero Section', description: 'Main carousel on homepage' },
  { value: 'secondary', label: 'Secondary Banner', description: 'Below hero section' },
  { value: 'sidebar', label: 'Sidebar Banner', description: 'Product page sidebar' },
  { value: 'footer', label: 'Footer Banner', description: 'Footer promotional area' }
]

export function BannerManagement() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [formData, setFormData] = useState<BannerFormData>({
    title: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
    linkText: '',
    position: 'hero',
    isActive: true,
    startDate: '',
    endDate: '',
    displayOrder: 1
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchBanners()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchBanners = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/banners')
      if (response.ok) {
        const data = await response.json()
        setBanners(data.banners || [])
      }
    } catch (error) {
      console.error('Error fetching banners:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch banners',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingBanner ? `/api/admin/banners/${editingBanner.id}` : '/api/admin/banners'
      const method = editingBanner ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        toast({
          title: 'Success',
          description: `Banner ${editingBanner ? 'updated' : 'created'} successfully`
        })
        setIsDialogOpen(false)
        resetForm()
        fetchBanners()
      } else {
        throw new Error('Failed to save banner')
      }
    } catch (error) {
      console.error('Error saving banner:', error)
      toast({
        title: 'Error',
        description: 'Failed to save banner',
        variant: 'destructive'
      })
    }
  }

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner)
    setFormData({
      title: banner.title,
      description: banner.description || '',
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl || '',
      linkText: banner.linkText || '',
      position: banner.position,
      isActive: banner.isActive,
      startDate: banner.startDate ? new Date(banner.startDate).toISOString().split('T')[0] : '',
      endDate: banner.endDate ? new Date(banner.endDate).toISOString().split('T')[0] : '',
      displayOrder: banner.displayOrder
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (bannerId: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return
    
    try {
      const response = await fetch(`/api/admin/banners/${bannerId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Banner deleted successfully'
        })
        fetchBanners()
      } else {
        throw new Error('Failed to delete banner')
      }
    } catch (error) {
      console.error('Error deleting banner:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete banner',
        variant: 'destructive'
      })
    }
  }

  const handleToggleActive = async (bannerId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/banners/${bannerId}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      })
      
      if (response.ok) {
        toast({
          title: 'Success',
          description: `Banner ${!isActive ? 'activated' : 'deactivated'} successfully`
        })
        fetchBanners()
      }
    } catch (error) {
      console.error('Error toggling banner:', error)
      toast({
        title: 'Error',
        description: 'Failed to update banner status',
        variant: 'destructive'
      })
    }
  }

  const resetForm = () => {
    setEditingBanner(null)
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      linkUrl: '',
      linkText: '',
      position: 'hero',
      isActive: true,
      startDate: '',
      endDate: '',
      displayOrder: 1
    })
  }

  const getStatusBadge = (banner: Banner) => {
    const now = new Date()
    const startDate = banner.startDate ? new Date(banner.startDate) : null
    const endDate = banner.endDate ? new Date(banner.endDate) : null
    
    if (!banner.isActive) {
      return <Badge variant="secondary">Inactive</Badge>
    }
    
    if (startDate && now < startDate) {
      return <Badge variant="outline">Scheduled</Badge>
    }
    
    if (endDate && now > endDate) {
      return <Badge variant="destructive">Expired</Badge>
    }
    
    return <Badge variant="default">Active</Badge>
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const calculateCTR = (clicks: number, impressions: number) => {
    if (impressions === 0) return '0%'
    return ((clicks / impressions) * 100).toFixed(2) + '%'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-brand">Banner Management</h1>
          <p className="text-gray-600">Manage promotional banners and sliders</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-brand hover:bg-brand-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingBanner ? 'Edit Banner' : 'Create New Banner'}
              </DialogTitle>
              <DialogDescription>
                Configure banner content, scheduling, and display settings
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Banner title"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Position *</label>
                  <Select value={formData.position} onValueChange={(value: string) => setFormData({ ...formData, position: value as 'hero' | 'secondary' | 'sidebar' | 'footer' })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BANNER_POSITIONS.map(pos => (
                        <SelectItem key={pos.value} value={pos.value}>
                          <div>
                            <div className="font-medium">{pos.label}</div>
                            <div className="text-xs text-gray-500">{pos.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Banner description or subtitle"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Image URL *</label>
                <Input
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/banner-image.jpg"
                  required
                />
                {formData.imageUrl && (
                  <div className="mt-2">
                    <Image
                      src={formData.imageUrl}
                      alt="Banner preview"
                      width={400}
                      height={128}
                      className="max-w-full h-32 object-cover rounded border"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Link URL</label>
                  <Input
                    value={formData.linkUrl}
                    onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                    placeholder="https://example.com/target-page"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Link Text</label>
                  <Input
                    value={formData.linkText}
                    onChange={(e) => setFormData({ ...formData, linkText: e.target.value })}
                    placeholder="Learn More, Shop Now, etc."
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Display Order</label>
                  <Input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
                    min="1"
                    max="100"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Date</label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">End Date</label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <label className="text-sm font-medium">Active</label>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-brand hover:bg-brand-600">
                  {editingBanner ? 'Update Banner' : 'Create Banner'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Banners</p>
                <p className="text-2xl font-bold text-gray-900">{banners.length}</p>
              </div>
              <ImageIcon className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Banners</p>
                <p className="text-2xl font-bold text-gray-900">
                  {banners.filter(b => b.isActive).length}
                </p>
              </div>
              <Play className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                <p className="text-2xl font-bold text-gray-900">
                  {banners.reduce((sum, b) => sum + b.clickCount, 0).toLocaleString()}
                </p>
              </div>
              <LinkIcon className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. CTR</p>
                <p className="text-2xl font-bold text-gray-900">
                  {calculateCTR(
                    banners.reduce((sum, b) => sum + b.clickCount, 0),
                    banners.reduce((sum, b) => sum + b.impressions, 0)
                  )}
                </p>
              </div>
              <RotateCcw className="w-8 h-8 text-gold" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Banners Table */}
      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle>All Banners</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Banner</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.map((banner) => (
                <TableRow key={banner.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Image
                        src={banner.imageUrl}
                        alt={banner.title}
                        width={64}
                        height={40}
                        className="w-16 h-10 object-cover rounded border"
                      />
                      <div>
                        <div className="font-medium">{banner.title}</div>
                        {banner.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {banner.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {BANNER_POSITIONS.find(p => p.value === banner.position)?.label}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(banner)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {banner.startDate && (
                        <div>Start: {formatDate(banner.startDate)}</div>
                      )}
                      {banner.endDate && (
                        <div>End: {formatDate(banner.endDate)}</div>
                      )}
                      {!banner.startDate && !banner.endDate && (
                        <span className="text-gray-500">No schedule</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{banner.clickCount} clicks</div>
                      <div className="text-gray-500">
                        {calculateCTR(banner.clickCount, banner.impressions)} CTR
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(banner)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleActive(banner.id, banner.isActive)}>
                          {banner.isActive ? (
                            <>
                              <EyeOff className="w-4 h-4 mr-2" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4 mr-2" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(banner.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {banners.length === 0 && (
            <div className="text-center py-12">
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No banners yet</h3>
              <p className="text-gray-500 mb-4">Create your first promotional banner to get started</p>
              <Button onClick={() => setIsDialogOpen(true)} className="bg-brand hover:bg-brand-600">
                <Plus className="w-4 h-4 mr-2" />
                Add First Banner
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
