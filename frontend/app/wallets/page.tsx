"use client"

import { useState, useEffect } from "react"
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
import { Wallet, Plus, Trash2, Edit, CheckCircle, AlertTriangle, TrendingUp, DollarSign, Coins } from "lucide-react"
import { PageHeader } from "@/components/PageHeader"

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
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        title="Multi-Wallet Manager"
        description="Manage multiple wallets as portfolio groups with consolidated tracking"
        actions={
          <Dialog open={createGroupOpen} onOpenChange={setCreateGroupOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Group
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Wallet Group</DialogTitle>
              <DialogDescription>
                Create a new group to manage multiple wallets as a single portfolio
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="group-name">Group Name</Label>
                <Input
                  id="group-name"
                  placeholder="Main Portfolio"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="group-description">Description (Optional)</Label>
                <Textarea
                  id="group-description"
                  placeholder="Primary trading wallets across all chains"
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateGroupOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createGroup}>Create Group</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        }
      />

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Groups List */}
        <div className="space-y-2">
          <h3 className="font-semibold mb-2">Your Groups</h3>
          {groups.map((group) => (
            <Card
              key={group.id}
              className={`cursor-pointer transition-colors ${
                selectedGroup?.id === group.id ? "border-primary bg-primary/5" : ""
              }`}
              onClick={() => setSelectedGroup(group)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4" />
                      <p className="font-medium">{group.name}</p>
                    </div>
                    {group.is_default && (
                      <Badge variant="secondary" className="mt-1 text-xs">
                        Default
                      </Badge>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {group.members?.length || 0} wallets
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteGroup(group.id)
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {selectedGroup ? (
            <>
              {/* Group Summary Cards */}
              {selectedGroup.consolidated_balance && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total Portfolio Value
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">
                          {formatCurrency(selectedGroup.consolidated_balance.total_value_usd)}
                        </div>
                        <DollarSign className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Unique Tokens
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">
                          {selectedGroup.consolidated_balance.total_tokens}
                        </div>
                        <Coins className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Wallets Tracked
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">
                          {selectedGroup.members?.filter(m => m.is_active).length || 0}
                        </div>
                        <Wallet className="h-8 w-8 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <Tabs defaultValue="wallets" className="space-y-4">
                <div className="flex justify-between items-center">
                  <TabsList>
                    <TabsTrigger value="wallets">
                      Wallets ({selectedGroup.members?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="balances">
                      Consolidated Balances
                    </TabsTrigger>
                    <TabsTrigger value="transfers">
                      Inter-Wallet Transfers
                    </TabsTrigger>
                  </TabsList>
                  <Button onClick={syncGroup} variant="outline">
                    Sync Group
                  </Button>
                </div>

                {/* Wallets Tab */}
                <TabsContent value="wallets" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle>{selectedGroup.name}</CardTitle>
                          <CardDescription>{selectedGroup.description}</CardDescription>
                        </div>
                        <Dialog open={addWalletOpen} onOpenChange={(open) => { setAddWalletOpen(open); if (open) setError("") }}>
                          <DialogTrigger asChild>
                            <Button size="sm">
                              <Plus className="mr-2 h-4 w-4" />
                              Add Wallet
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Wallet to Group</DialogTitle>
                              <DialogDescription>
                                Add a wallet address to track in this group
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="wallet-address">Wallet Address</Label>
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
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="wallet-chain">Chain (auto-detected)</Label>
                                <Select value={walletChain} onValueChange={setWalletChain}>
                                  <SelectTrigger id="wallet-chain">
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
                                <p className="text-xs text-muted-foreground">
                                  Chain is automatically detected from address format. You can change it if needed.
                                </p>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="wallet-label">Label (Optional)</Label>
                                <Input
                                  id="wallet-label"
                                  placeholder="Main Trading Wallet"
                                  value={walletLabel}
                                  onChange={(e) => setWalletLabel(e.target.value)}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setAddWalletOpen(false)}>
                                Cancel
                              </Button>
                              <Button onClick={addWallet}>Add Wallet</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {selectedGroup.members && selectedGroup.members.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Address</TableHead>
                              <TableHead>Chain</TableHead>
                              <TableHead>Label</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Added</TableHead>
                              <TableHead></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedGroup.members.map((member) => (
                              <TableRow key={member.id}>
                                <TableCell className="font-mono">
                                  {shortenAddress(member.wallet_address)}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">{member.chain}</Badge>
                                </TableCell>
                                <TableCell>{member.label || "-"}</TableCell>
                                <TableCell>
                                  {member.is_active ? (
                                    <Badge variant="default" className="bg-green-600">
                                      <CheckCircle className="mr-1 h-3 w-3" />
                                      Active
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary">Inactive</Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {formatDate(member.added_at)}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeWallet(member.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="text-center py-12">
                          <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No wallets in this group yet</p>
                          <Button className="mt-4" onClick={() => { setAddWalletOpen(true); setError("") }}>
                            Add Your First Wallet
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Balances Tab */}
                <TabsContent value="balances" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Consolidated Token Balances</CardTitle>
                      <CardDescription>
                        Combined holdings across all wallets in this group
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {selectedGroup.consolidated_balance?.by_token && selectedGroup.consolidated_balance.by_token.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Token</TableHead>
                              <TableHead>Total Amount</TableHead>
                              <TableHead>Value (USD)</TableHead>
                              <TableHead>Avg Cost Basis</TableHead>
                              <TableHead>Unrealized P/L</TableHead>
                              <TableHead>P/L %</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedGroup.consolidated_balance.by_token.map((token, idx) => (
                              <TableRow key={idx}>
                                <TableCell className="font-medium">{token.token}</TableCell>
                                <TableCell>{token.total_amount.toFixed(4)}</TableCell>
                                <TableCell>{formatCurrency(token.total_value_usd)}</TableCell>
                                <TableCell>{formatCurrency(token.avg_cost_basis)}</TableCell>
                                <TableCell>
                                  <span className={token.unrealized_gain_loss >= 0 ? "text-green-600" : "text-red-600"}>
                                    {formatCurrency(token.unrealized_gain_loss)}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={token.unrealized_gain_loss_percent >= 0 ? "default" : "destructive"}>
                                    {token.unrealized_gain_loss_percent >= 0 ? "+" : ""}
                                    {token.unrealized_gain_loss_percent.toFixed(2)}%
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="text-center py-12">
                          <Coins className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No consolidated balance data yet</p>
                          <Button className="mt-4" onClick={syncGroup}>
                            Sync to Load Balances
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Transfers Tab */}
                <TabsContent value="transfers" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Inter-Wallet Transfers</CardTitle>
                      <CardDescription>
                        Transfers between wallets in this group (non-taxable events)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {transfers.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>From</TableHead>
                              <TableHead>To</TableHead>
                              <TableHead>Token</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {transfers.map((transfer) => (
                              <TableRow key={transfer.id}>
                                <TableCell className="font-mono text-xs">
                                  {shortenAddress(transfer.from_wallet_address)}
                                  <br />
                                  <span className="text-muted-foreground">{transfer.from_chain}</span>
                                </TableCell>
                                <TableCell className="font-mono text-xs">
                                  {shortenAddress(transfer.to_wallet_address)}
                                  <br />
                                  <span className="text-muted-foreground">{transfer.to_chain}</span>
                                </TableCell>
                                <TableCell className="font-medium">{transfer.token}</TableCell>
                                <TableCell>{transfer.amount.toFixed(4)}</TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {formatDate(transfer.timestamp)}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">{transfer.transfer_type}</Badge>
                                </TableCell>
                                <TableCell>
                                  {transfer.is_confirmed ? (
                                    <Badge variant="default" className="bg-green-600">
                                      <CheckCircle className="mr-1 h-3 w-3" />
                                      Confirmed
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary">Pending</Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="text-center py-12">
                          <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No inter-wallet transfers detected</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Create a wallet group to get started
                  </p>
                  <Button onClick={() => setCreateGroupOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Group
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
