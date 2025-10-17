"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Wallet, Plus, Trash2, Edit, CheckCircle, AlertTriangle, TrendingUp, DollarSign, Coins, RefreshCw, Layers } from "lucide-react"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface WalletGroup {
  id: number
  user_id: number
  name: string
  description: string | null
  is_default: boolean
  created_at: string
  updated_at: string
  wallet_count: number
  wallets?: WalletMember[]  // Backend returns "wallets" not "members"
  members?: WalletMember[]  // Keep for backward compatibility
  consolidated_balance?: ConsolidatedBalance
}

interface WalletMember {
  id: number
  group_id: number
  wallet_address: string
  chain: string
  label: string | null
  is_active: boolean
  added_at: string
}

interface ConsolidatedBalance {
  total_value_usd: number
  total_tokens: number
  by_token: {
    token: string
    total_amount: number
    total_value_usd: number
    avg_cost_basis: number
    unrealized_gain_loss: number
    unrealized_gain_loss_percent: number
  }[]
}

interface InterWalletTransfer {
  id: number
  group_id: number
  from_wallet_address: string
  from_chain: string
  from_tx_hash: string
  to_wallet_address: string
  to_chain: string
  to_tx_hash: string | null
  token: string
  amount: number
  timestamp: string
  transfer_type: "internal" | "external_in" | "external_out"
  is_confirmed: boolean
  confidence_score: number
  is_taxable: boolean
  notes: string | null
}

// Detect blockchain from wallet address
function detectChainFromAddress(address: string): string {
  const addr = address.trim()

  // EVM addresses (0x...)
  if (/^0x[a-fA-F0-9]{40}$/.test(addr)) {
    return "ethereum" // Default to Ethereum, user can change to polygon, bsc, etc.
  }

  // Solana (base58, 32-44 chars)
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr)) {
    return "solana"
  }

  // Bitcoin Legacy (starts with 1)
  if (/^1[a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(addr)) {
    return "bitcoin"
  }

  // Bitcoin SegWit (starts with 3)
  if (/^3[a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(addr)) {
    return "bitcoin"
  }

  // Bitcoin Bech32 (starts with bc1)
  if (/^bc1[a-z0-9]{39,59}$/i.test(addr)) {
    return "bitcoin"
  }

  // Cardano (starts with addr1)
  if (/^addr1[a-z0-9]{98}$/i.test(addr)) {
    return "cardano"
  }

  // Cosmos (starts with cosmos1)
  if (/^cosmos1[a-z0-9]{38}$/i.test(addr)) {
    return "cosmos"
  }

  // Polkadot (SS58 format, starts with 1)
  if (/^[1-9A-HJ-NP-Za-km-z]{47,48}$/.test(addr) && ['1', 'F', 'G', 'H'].includes(addr[0])) {
    return "polkadot"
  }

  // Ripple (starts with r)
  if (/^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(addr)) {
    return "ripple"
  }

  // Litecoin (starts with L or M)
  if (/^[LM][a-km-zA-HJ-NP-Z1-9]{26,33}$/.test(addr)) {
    return "litecoin"
  }

  // Litecoin Bech32 (starts with ltc1)
  if (/^ltc1[a-z0-9]{39,59}$/i.test(addr)) {
    return "litecoin"
  }

  return "ethereum" // Default fallback
}

export default function WalletsPage() {
  const [groups, setGroups] = useState<WalletGroup[]>([])
  const [selectedGroup, setSelectedGroup] = useState<WalletGroup | null>(null)
  const [transfers, setTransfers] = useState<InterWalletTransfer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Create group dialog
  const [createGroupOpen, setCreateGroupOpen] = useState(false)
  const [groupName, setGroupName] = useState("")
  const [groupDescription, setGroupDescription] = useState("")

  // Add wallet dialog
  const [addWalletOpen, setAddWalletOpen] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [walletChain, setWalletChain] = useState("ethereum")
  const [walletLabel, setWalletLabel] = useState("")

  useEffect(() => {
    loadGroups()
  }, [])

  useEffect(() => {
    if (selectedGroup) {
      loadGroupDetails(selectedGroup.id)
      loadTransfers(selectedGroup.id)
    }
  }, [selectedGroup?.id])

  const loadGroups = async () => {
    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("access_token")
      const response = await fetch(`${API_URL}/wallet-groups/groups`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to load wallet groups")
      }

      const data = await response.json()

      // Map wallets to members for each group
      const groupsWithMembers = data.map((group: any) => ({
        ...group,
        members: group.wallets || []
      }))

      setGroups(groupsWithMembers)

      if (groupsWithMembers.length > 0 && !selectedGroup) {
        setSelectedGroup(groupsWithMembers[0])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const loadGroupDetails = async (groupId: number) => {
    if (!groupId) return

    try {
      const token = localStorage.getItem("access_token")
      if (!token) {
        console.error("No authentication token")
        return
      }

      const response = await fetch(`${API_URL}/wallet-groups/groups/${groupId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Failed to load group details (${response.status})`)
      }

      const data = await response.json()
      console.log("Loaded group details:", data)
      console.log("Group wallets from API:", data.wallets)

      // Backend returns "wallets", map to "members" for compatibility
      const groupData = {
        ...data,
        members: data.wallets || []
      }
      console.log("Mapped members:", groupData.members)
      setSelectedGroup(groupData)

      setGroups(prev => prev.map(g => g.id === groupId ? groupData : g))
    } catch (err) {
      console.error("Failed to load group details:", err)
      setError(err instanceof Error ? err.message : "Failed to load group")
    }
  }

  const loadTransfers = async (groupId: number) => {
    if (!groupId) return

    try {
      const token = localStorage.getItem("access_token")
      if (!token) {
        console.error("No authentication token")
        return
      }

      const response = await fetch(`${API_URL}/wallet-groups/groups/${groupId}/transfers`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.warn(`Failed to load transfers: ${errorData.detail || response.status}`)
        return
      }

      const data = await response.json()
      setTransfers(data.transfers || [])
    } catch (err) {
      console.error("Failed to load transfers:", err)
    }
  }

  const createGroup = async () => {
    if (!groupName) {
      setError("Please enter a group name")
      return
    }

    try {
      const token = localStorage.getItem("access_token")
      const response = await fetch(`${API_URL}/wallet-groups/groups`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: groupName,
          description: groupDescription || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Failed to create group (${response.status})`)
      }

      const newGroup = await response.json()

      // Map wallets to members
      const groupWithMembers = {
        ...newGroup,
        members: newGroup.wallets || []
      }

      setGroups([...groups, groupWithMembers])
      setSelectedGroup(groupWithMembers)
      setCreateGroupOpen(false)
      setGroupName("")
      setGroupDescription("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    }
  }

  const addWallet = async () => {
    if (!walletAddress || !selectedGroup) {
      setError("Please enter a wallet address")
      return
    }

    // Client-side duplicate check
    const normalizedAddress = walletAddress.toLowerCase().trim()
    const existingWallet = selectedGroup.members?.find(
      m => m.wallet_address.toLowerCase() === normalizedAddress && m.chain === walletChain
    )

    if (existingWallet) {
      setError(`This wallet already exists in the group${existingWallet.label ? ` as "${existingWallet.label}"` : ''}`)
      return
    }

    try {
      const token = localStorage.getItem("access_token")
      if (!token) {
        setError("No authentication token. Please log in again.")
        return
      }

      const requestBody = {
        wallet_address: walletAddress.trim(),
        chain: walletChain,
        label: walletLabel || null,
      }

      const response = await fetch(`${API_URL}/wallet-groups/groups/${selectedGroup.id}/wallets`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        let errorMessage = `Failed to add wallet (${response.status})`
        try {
          const errorData = await response.json()
          console.error("Server error response:", errorData)

          if (errorData.detail) {
            // Handle Pydantic validation errors (array format)
            if (Array.isArray(errorData.detail)) {
              errorMessage = errorData.detail
                .map((err: any) => `${err.loc?.join('.') || 'Field'}: ${err.msg}`)
                .join(', ')
            }
            // Handle string detail
            else if (typeof errorData.detail === 'string') {
              errorMessage = errorData.detail
            }
            // Handle object detail
            else if (typeof errorData.detail === 'object') {
              errorMessage = JSON.stringify(errorData.detail)
            }
          }
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError)
        }
        throw new Error(errorMessage)
      }

      await loadGroupDetails(selectedGroup.id)
      setAddWalletOpen(false)
      setWalletAddress("")
      setWalletLabel("")
      setError("") // Clear any previous errors
    } catch (err) {
      console.error("Failed to add wallet:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    }
  }

  const removeWallet = async (memberId: number) => {
    if (!selectedGroup) return

    try {
      const token = localStorage.getItem("access_token")
      const response = await fetch(`${API_URL}/wallet-groups/${selectedGroup.id}/wallets/${memberId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to remove wallet")
      }

      await loadGroupDetails(selectedGroup.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    }
  }

  const deleteGroup = async (groupId: number) => {
    if (!confirm("Are you sure you want to delete this group?")) {
      return
    }

    try {
      const token = localStorage.getItem("access_token")
      const response = await fetch(`${API_URL}/wallet-groups/groups/${groupId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete group")
      }

      setGroups(groups.filter(g => g.id !== groupId))
      if (selectedGroup?.id === groupId) {
        setSelectedGroup(groups.find(g => g.id !== groupId) || null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    }
  }

  const syncGroup = async () => {
    if (!selectedGroup) return

    try {
      const token = localStorage.getItem("access_token")
      const response = await fetch(`${API_URL}/wallet-groups/${selectedGroup.id}/sync`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to sync group")
      }

      await loadGroupDetails(selectedGroup.id)
      await loadTransfers(selectedGroup.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-violet-50/30 to-fuchsia-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-4xl mx-auto mb-12"
          >
            <div className="inline-flex items-center justify-center gap-2 mb-6">
              <div className="p-3 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl shadow-lg">
                <Layers className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Multi-Wallet{" "}
              <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                Manager
              </span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
              Manage multiple wallets as portfolio groups with consolidated tracking across all chains
            </p>

            <Dialog open={createGroupOpen} onOpenChange={setCreateGroupOpen}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Create Wallet Group
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">Create Wallet Group</DialogTitle>
                  <DialogDescription>
                    Create a new group to manage multiple wallets as a single portfolio
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="group-name" className="text-sm font-semibold">Group Name</Label>
                    <Input
                      id="group-name"
                      placeholder="Main Portfolio"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      className="border-slate-300 dark:border-slate-700 focus:border-violet-500 dark:focus:border-fuchsia-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="group-description" className="text-sm font-semibold">Description (Optional)</Label>
                    <Textarea
                      id="group-description"
                      placeholder="Primary trading wallets across all chains"
                      value={groupDescription}
                      onChange={(e) => setGroupDescription(e.target.value)}
                      className="border-slate-300 dark:border-slate-700 focus:border-violet-500 dark:focus:border-fuchsia-500"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateGroupOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={createGroup}
                    className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white"
                  >
                    Create Group
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Alert variant="destructive" className="border-red-200 dark:border-red-800">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar - Groups List */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Wallet className="h-5 w-5 text-violet-600 dark:text-fuchsia-400" />
                Your Groups
              </h3>
              <div className="space-y-3">
                {groups.map((group, index) => (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                  >
                    <Card
                      className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                        selectedGroup?.id === group.id
                          ? "border-violet-500 dark:border-fuchsia-500 bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-950/30 dark:to-fuchsia-950/30 shadow-md"
                          : "border-slate-200 dark:border-slate-800 hover:border-violet-300 dark:hover:border-fuchsia-700"
                      }`}
                      onClick={() => setSelectedGroup(group)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="p-2 bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-900/30 dark:to-fuchsia-900/30 rounded-lg">
                                <Wallet className="h-4 w-4 text-violet-600 dark:text-fuchsia-400" />
                              </div>
                              <p className="font-semibold text-slate-900 dark:text-white">{group.name}</p>
                            </div>
                            {group.is_default && (
                              <Badge
                                variant="secondary"
                                className="mb-2 text-xs bg-violet-100 dark:bg-fuchsia-900/50 text-violet-700 dark:text-fuchsia-300"
                              >
                                Default
                              </Badge>
                            )}
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              {group.members?.length || 0} wallets
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-red-600 dark:hover:text-red-400"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteGroup(group.id)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="lg:col-span-3 space-y-6"
            >
              {selectedGroup ? (
                <>
                  {/* Group Summary Cards */}
                  {selectedGroup.consolidated_balance && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                      <Card className="border-slate-200 dark:border-slate-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400 flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Total Portfolio Value
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="text-3xl font-bold text-green-900 dark:text-green-100">
                              {formatCurrency(selectedGroup.consolidated_balance.total_value_usd)}
                            </div>
                            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                              <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-slate-200 dark:border-slate-800 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400 flex items-center gap-2">
                            <Coins className="h-4 w-4" />
                            Unique Tokens
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                              {selectedGroup.consolidated_balance.total_tokens}
                            </div>
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                              <Coins className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-slate-200 dark:border-slate-800 bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-950/20 dark:to-fuchsia-950/20 hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-violet-700 dark:text-fuchsia-400 flex items-center gap-2">
                            <Wallet className="h-4 w-4" />
                            Wallets Tracked
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="text-3xl font-bold text-violet-900 dark:text-fuchsia-100">
                              {selectedGroup.members?.filter(m => m.is_active).length || 0}
                            </div>
                            <div className="p-3 bg-violet-100 dark:bg-fuchsia-900/30 rounded-xl">
                              <Wallet className="h-8 w-8 text-violet-600 dark:text-fuchsia-400" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  <Tabs defaultValue="wallets" className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                      <TabsList className="bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                        <TabsTrigger
                          value="wallets"
                          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-fuchsia-600 data-[state=active]:text-white rounded-lg transition-all"
                        >
                          Wallets ({selectedGroup.members?.length || 0})
                        </TabsTrigger>
                        <TabsTrigger
                          value="balances"
                          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-fuchsia-600 data-[state=active]:text-white rounded-lg transition-all"
                        >
                          Consolidated Balances
                        </TabsTrigger>
                        <TabsTrigger
                          value="transfers"
                          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-fuchsia-600 data-[state=active]:text-white rounded-lg transition-all"
                        >
                          Inter-Wallet Transfers
                        </TabsTrigger>
                      </TabsList>
                      <Button
                        onClick={syncGroup}
                        variant="outline"
                        className="border-violet-300 dark:border-fuchsia-700 text-violet-700 dark:text-fuchsia-400 hover:bg-violet-50 dark:hover:bg-fuchsia-950/20 transition-all"
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Sync Group
                      </Button>
                    </div>

                    {/* Wallets Tab */}
                    <TabsContent value="wallets" className="space-y-4">
                      <Card className="border-slate-200 dark:border-slate-800 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-950/20 dark:to-fuchsia-950/20 rounded-t-xl">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                              <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Wallet className="h-6 w-6 text-violet-600 dark:text-fuchsia-400" />
                                {selectedGroup.name}
                              </CardTitle>
                              <CardDescription className="text-slate-600 dark:text-slate-400 mt-1">
                                {selectedGroup.description}
                              </CardDescription>
                            </div>
                            <Dialog open={addWalletOpen} onOpenChange={(open) => { setAddWalletOpen(open); if (open) setError("") }}>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-md hover:shadow-lg transition-all"
                                >
                                  <Plus className="mr-2 h-4 w-4" />
                                  Add Wallet
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-lg">
                                <DialogHeader>
                                  <DialogTitle className="text-2xl font-bold">Add Wallet to Group</DialogTitle>
                                  <DialogDescription>
                                    Add a wallet address to track in this group
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="wallet-address" className="text-sm font-semibold">Wallet Address</Label>
                                    <Input
                                      id="wallet-address"
                                      placeholder="0x..., 1A1zP1..., 7xKXtg..., etc."
                                      value={walletAddress}
                                      onChange={(e) => {
                                        const address = e.target.value
                                        setWalletAddress(address)
                                        // Auto-detect chain when address is entered
                                        if (address.length >= 26) {
                                          const detectedChain = detectChainFromAddress(address)
                                          setWalletChain(detectedChain)
                                        }
                                      }}
                                      className="border-slate-300 dark:border-slate-700 focus:border-violet-500 dark:focus:border-fuchsia-500"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="wallet-chain" className="text-sm font-semibold">Chain (auto-detected)</Label>
                                    <Select value={walletChain} onValueChange={setWalletChain}>
                                      <SelectTrigger id="wallet-chain" className="border-slate-300 dark:border-slate-700 focus:border-violet-500 dark:focus:border-fuchsia-500">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="ethereum">Ethereum</SelectItem>
                                        <SelectItem value="polygon">Polygon</SelectItem>
                                        <SelectItem value="bsc">BSC (Binance Smart Chain)</SelectItem>
                                        <SelectItem value="arbitrum">Arbitrum</SelectItem>
                                        <SelectItem value="optimism">Optimism</SelectItem>
                                        <SelectItem value="base">Base</SelectItem>
                                        <SelectItem value="avalanche">Avalanche C-Chain</SelectItem>
                                        <SelectItem value="solana">Solana</SelectItem>
                                        <SelectItem value="bitcoin">Bitcoin</SelectItem>
                                        <SelectItem value="cardano">Cardano</SelectItem>
                                        <SelectItem value="cosmos">Cosmos</SelectItem>
                                        <SelectItem value="polkadot">Polkadot</SelectItem>
                                        <SelectItem value="ripple">Ripple (XRP)</SelectItem>
                                        <SelectItem value="litecoin">Litecoin</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                      Chain is automatically detected from address format. You can change it if needed.
                                    </p>
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="wallet-label" className="text-sm font-semibold">Label (Optional)</Label>
                                    <Input
                                      id="wallet-label"
                                      placeholder="Main Trading Wallet"
                                      value={walletLabel}
                                      onChange={(e) => setWalletLabel(e.target.value)}
                                      className="border-slate-300 dark:border-slate-700 focus:border-violet-500 dark:focus:border-fuchsia-500"
                                    />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setAddWalletOpen(false)}>
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={addWallet}
                                    className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white"
                                  >
                                    Add Wallet
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {selectedGroup.members && selectedGroup.members.length > 0 ? (
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow className="border-slate-200 dark:border-slate-800">
                                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Address</TableHead>
                                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Chain</TableHead>
                                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Label</TableHead>
                                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Status</TableHead>
                                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Added</TableHead>
                                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300"></TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {selectedGroup.members.map((member, index) => (
                                    <motion.tr
                                      key={member.id}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ duration: 0.3, delay: 0.05 * index }}
                                      className="border-slate-200 dark:border-slate-800 hover:bg-violet-50 dark:hover:bg-violet-950/20 transition-colors"
                                    >
                                      <TableCell className="font-mono text-sm text-slate-900 dark:text-white">
                                        {shortenAddress(member.wallet_address)}
                                      </TableCell>
                                      <TableCell>
                                        <Badge variant="outline" className="border-violet-300 dark:border-fuchsia-700 text-violet-700 dark:text-fuchsia-400">
                                          {member.chain}
                                        </Badge>
                                      </TableCell>
                                      <TableCell className="text-slate-700 dark:text-slate-300">{member.label || "-"}</TableCell>
                                      <TableCell>
                                        {member.is_active ? (
                                          <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white">
                                            <CheckCircle className="mr-1 h-3 w-3" />
                                            Active
                                          </Badge>
                                        ) : (
                                          <Badge variant="secondary" className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                            Inactive
                                          </Badge>
                                        )}
                                      </TableCell>
                                      <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                                        {formatDate(member.added_at)}
                                      </TableCell>
                                      <TableCell>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => removeWallet(member.id)}
                                          className="text-slate-500 hover:text-red-600 dark:hover:text-red-400"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </TableCell>
                                    </motion.tr>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          ) : (
                            <div className="text-center py-16">
                              <div className="inline-flex p-4 bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-900/30 dark:to-fuchsia-900/30 rounded-2xl mb-4">
                                <Wallet className="h-12 w-12 text-violet-600 dark:text-fuchsia-400" />
                              </div>
                              <p className="text-slate-600 dark:text-slate-400 mb-4">No wallets in this group yet</p>
                              <Button
                                className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-md hover:shadow-lg transition-all"
                                onClick={() => { setAddWalletOpen(true); setError("") }}
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Your First Wallet
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Balances Tab */}
                    <TabsContent value="balances" className="space-y-4">
                      <Card className="border-slate-200 dark:border-slate-800 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-950/20 dark:to-fuchsia-950/20 rounded-t-xl">
                          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Coins className="h-6 w-6 text-violet-600 dark:text-fuchsia-400" />
                            Consolidated Token Balances
                          </CardTitle>
                          <CardDescription className="text-slate-600 dark:text-slate-400">
                            Combined holdings across all wallets in this group
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {selectedGroup.consolidated_balance?.by_token && selectedGroup.consolidated_balance.by_token.length > 0 ? (
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow className="border-slate-200 dark:border-slate-800">
                                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Token</TableHead>
                                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Total Amount</TableHead>
                                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Value (USD)</TableHead>
                                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Avg Cost Basis</TableHead>
                                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Unrealized P/L</TableHead>
                                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">P/L %</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {selectedGroup.consolidated_balance.by_token.map((token, idx) => (
                                    <motion.tr
                                      key={idx}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ duration: 0.3, delay: 0.05 * idx }}
                                      className="border-slate-200 dark:border-slate-800 hover:bg-violet-50 dark:hover:bg-violet-950/20 transition-colors"
                                    >
                                      <TableCell className="font-semibold text-slate-900 dark:text-white">{token.token}</TableCell>
                                      <TableCell className="text-slate-700 dark:text-slate-300">{token.total_amount.toFixed(4)}</TableCell>
                                      <TableCell className="text-slate-700 dark:text-slate-300">{formatCurrency(token.total_value_usd)}</TableCell>
                                      <TableCell className="text-slate-700 dark:text-slate-300">{formatCurrency(token.avg_cost_basis)}</TableCell>
                                      <TableCell>
                                        <span className={token.unrealized_gain_loss >= 0 ? "text-green-600 dark:text-green-400 font-semibold" : "text-red-600 dark:text-red-400 font-semibold"}>
                                          {formatCurrency(token.unrealized_gain_loss)}
                                        </span>
                                      </TableCell>
                                      <TableCell>
                                        <Badge
                                          variant={token.unrealized_gain_loss_percent >= 0 ? "default" : "destructive"}
                                          className={token.unrealized_gain_loss_percent >= 0 ? "bg-green-600 hover:bg-green-700 text-white" : ""}
                                        >
                                          {token.unrealized_gain_loss_percent >= 0 ? "+" : ""}
                                          {token.unrealized_gain_loss_percent.toFixed(2)}%
                                        </Badge>
                                      </TableCell>
                                    </motion.tr>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          ) : (
                            <div className="text-center py-16">
                              <div className="inline-flex p-4 bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-900/30 dark:to-fuchsia-900/30 rounded-2xl mb-4">
                                <Coins className="h-12 w-12 text-violet-600 dark:text-fuchsia-400" />
                              </div>
                              <p className="text-slate-600 dark:text-slate-400 mb-4">No consolidated balance data yet</p>
                              <Button
                                className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-md hover:shadow-lg transition-all"
                                onClick={syncGroup}
                              >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Sync to Load Balances
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Transfers Tab */}
                    <TabsContent value="transfers" className="space-y-4">
                      <Card className="border-slate-200 dark:border-slate-800 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-950/20 dark:to-fuchsia-950/20 rounded-t-xl">
                          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <TrendingUp className="h-6 w-6 text-violet-600 dark:text-fuchsia-400" />
                            Inter-Wallet Transfers
                          </CardTitle>
                          <CardDescription className="text-slate-600 dark:text-slate-400">
                            Transfers between wallets in this group (non-taxable events)
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {transfers.length > 0 ? (
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow className="border-slate-200 dark:border-slate-800">
                                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">From</TableHead>
                                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">To</TableHead>
                                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Token</TableHead>
                                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Amount</TableHead>
                                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Date</TableHead>
                                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Type</TableHead>
                                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Status</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {transfers.map((transfer, index) => (
                                    <motion.tr
                                      key={transfer.id}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ duration: 0.3, delay: 0.05 * index }}
                                      className="border-slate-200 dark:border-slate-800 hover:bg-violet-50 dark:hover:bg-violet-950/20 transition-colors"
                                    >
                                      <TableCell className="font-mono text-xs">
                                        <div className="text-slate-900 dark:text-white">{shortenAddress(transfer.from_wallet_address)}</div>
                                        <span className="text-slate-500 dark:text-slate-400">{transfer.from_chain}</span>
                                      </TableCell>
                                      <TableCell className="font-mono text-xs">
                                        <div className="text-slate-900 dark:text-white">{shortenAddress(transfer.to_wallet_address)}</div>
                                        <span className="text-slate-500 dark:text-slate-400">{transfer.to_chain}</span>
                                      </TableCell>
                                      <TableCell className="font-semibold text-slate-900 dark:text-white">{transfer.token}</TableCell>
                                      <TableCell className="text-slate-700 dark:text-slate-300">{transfer.amount.toFixed(4)}</TableCell>
                                      <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                                        {formatDate(transfer.timestamp)}
                                      </TableCell>
                                      <TableCell>
                                        <Badge variant="outline" className="border-violet-300 dark:border-fuchsia-700 text-violet-700 dark:text-fuchsia-400">
                                          {transfer.transfer_type}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        {transfer.is_confirmed ? (
                                          <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white">
                                            <CheckCircle className="mr-1 h-3 w-3" />
                                            Confirmed
                                          </Badge>
                                        ) : (
                                          <Badge variant="secondary" className="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
                                            Pending
                                          </Badge>
                                        )}
                                      </TableCell>
                                    </motion.tr>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          ) : (
                            <div className="text-center py-16">
                              <div className="inline-flex p-4 bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-900/30 dark:to-fuchsia-900/30 rounded-2xl mb-4">
                                <TrendingUp className="h-12 w-12 text-violet-600 dark:text-fuchsia-400" />
                              </div>
                              <p className="text-slate-600 dark:text-slate-400">No inter-wallet transfers detected</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </>
              ) : (
                <Card className="border-slate-200 dark:border-slate-800 shadow-lg">
                  <CardContent className="py-20">
                    <div className="text-center">
                      <div className="inline-flex p-4 bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-900/30 dark:to-fuchsia-900/30 rounded-2xl mb-6">
                        <Wallet className="h-16 w-16 text-violet-600 dark:text-fuchsia-400" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                        No Wallet Group Selected
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 mb-6">
                        Create a wallet group to get started with tracking your portfolios
                      </p>
                      <Button
                        onClick={() => setCreateGroupOpen(true)}
                        className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Your First Group
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
