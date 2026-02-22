'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Trash2, Eye } from 'lucide-react'
import { Token } from '@/lib/types'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface TokenHistoryTableProps {
  tokens: Token[]
  loading?: boolean
  onDelete?: (id: string) => void
  onView?: (token: Token) => void
}

export function TokenHistoryTable({
  tokens,
  loading = false,
  onDelete,
  onView,
}: TokenHistoryTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'expired':
        return 'bg-slate-100 text-slate-800'
      case 'revoked':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'attendance':
        return 'bg-blue-100 text-blue-800'
      case 'event':
        return 'bg-purple-100 text-purple-800'
      case 'custom':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  if (loading) {
    return (
      <Card className="p-6 flex items-center justify-center h-64">
        <LoadingSpinner message="Loading tokens..." />
      </Card>
    )
  }

  if (tokens.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Token History</h3>
        <div className="flex items-center justify-center h-32 text-slate-500">
          No tokens generated yet
        </div>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Token History</h3>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tokens.map((token) => (
                <motion.tr
                  key={token.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="hover:bg-slate-50"
                >
                  <TableCell className="font-medium">{token.name}</TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(token.type)}>
                      {token.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {new Date(token.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {new Date(token.expiresAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(token.status)}>
                      {token.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{token.usageCount || 0}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView?.(token)}
                    >
                      <Eye size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => onDelete?.(token.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </motion.div>
  )
}
