'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '../../components/auth/protected-route';
import { useAccountsApi } from '../../hooks/use-accounts-api';
import { useAuth } from '../../contexts/auth-context';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Switch } from '../../components/ui/switch';
import { ArrowLeft, Settings, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AccountsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    createOwnerAccount,
    createShadowAccount,
    createSlaveAccount,
    deleteOwnerAccount,
    deleteShadowAccount,
    deleteSlaveAccount,
    getAllAccounts,
    ownerAccount,
    shadowAccount,
    slaveAccount,
    loading,
  } = useAccountsApi();

  const [activeTab, setActiveTab] = useState('owner');
  const [formData, setFormData] = useState({
    apiKey: '',
    apiSecret: '',
    passphrase: '',
    network: 'testnet' as 'mainnet' | 'testnet',
    quantity: 0,
    take_profit: 0,
    shadow_close: true,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Carregar contas ao montar o componente
  useEffect(() => {
    getAllAccounts();
  }, [getAllAccounts]);

  const resetForm = () => {
    setFormData({
      apiKey: '',
      apiSecret: '',
      passphrase: '',
      network: 'testnet',
      quantity: 0,
      take_profit: 0,
      shadow_close: true,
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (accountType: 'owner' | 'shadow' | 'slave') => {
    setError('');
    setSuccess('');

    if (!formData.apiKey || !formData.apiSecret || !formData.passphrase) {
      setError('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    try {
      let result;
      
      switch (accountType) {
        case 'owner':
          result = await createOwnerAccount({
            apiKey: formData.apiKey,
            apiSecret: formData.apiSecret,
            passphrase: formData.passphrase,
            network: formData.network,
          });
          break;
        case 'shadow':
          result = await createShadowAccount({
            apiKey: formData.apiKey,
            apiSecret: formData.apiSecret,
            passphrase: formData.passphrase,
            network: formData.network,
            quantity: formData.quantity,
            take_profit: formData.take_profit || undefined,
            shadow_close: formData.shadow_close,
          });
          break;
        case 'slave':
          result = await createSlaveAccount({
            apiKey: formData.apiKey,
            apiSecret: formData.apiSecret,
            passphrase: formData.passphrase,
            network: formData.network,
            quantity: formData.quantity,
          });
          break;
      }

      if (result.data) {
        setSuccess(`Conta ${accountType} configurada com sucesso!`);
        resetForm();
        getAllAccounts();
      } else {
        setError(result.error || 'Erro ao configurar conta');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    }
  };

  const handleDelete = async (accountType: 'owner' | 'shadow' | 'slave') => {
    if (!confirm(`Tem certeza que deseja remover a conta ${accountType}?`)) {
      return;
    }

    try {
      let result;
      
      switch (accountType) {
        case 'owner':
          result = await deleteOwnerAccount();
          break;
        case 'shadow':
          result = await deleteShadowAccount();
          break;
        case 'slave':
          result = await deleteSlaveAccount();
          break;
      }

      if (result.data || !result.error) {
        setSuccess(`Conta ${accountType} removida com sucesso!`);
        getAllAccounts();
      } else {
        setError(result.error || 'Erro ao remover conta');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    }
  };

  const AccountCard = ({ 
    account, 
    type, 
    onDelete 
  }: { 
    account: any; 
    type: string; 
    onDelete: () => void;
  }) => (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <CardTitle className="text-sm font-medium">
            Conta {type.charAt(0).toUpperCase() + type.slice(1)} Configurada
          </CardTitle>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onDelete}
          className="text-red-600 hover:text-red-800"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Network:</span>
            <Badge variant={account.network === 'mainnet' ? 'default' : 'secondary'}>
              {account.network}
            </Badge>
          </div>
          {account.quantity && (
            <div className="flex justify-between">
              <span className="text-gray-600">Quantidade:</span>
              <span>{account.quantity}</span>
            </div>
          )}
          {account.take_profit && (
            <div className="flex justify-between">
              <span className="text-gray-600">Take Profit:</span>
              <span>{account.take_profit}</span>
            </div>
          )}
          {account.shadow_close !== undefined && (
            <div className="flex justify-between">
              <span className="text-gray-600">Shadow Close:</span>
              <Badge variant={account.shadow_close ? 'default' : 'secondary'}>
                {account.shadow_close ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">Criado em:</span>
            <span>{new Date(account.created_at).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const AccountForm = ({ type }: { type: 'owner' | 'shadow' | 'slave' }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Configurar Conta {type.charAt(0).toUpperCase() + type.slice(1)}</span>
        </CardTitle>
        <CardDescription>
          Configure as credenciais da API LNMarkets para esta conta
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key *</Label>
            <Input
              id="apiKey"
              type="password"
              value={formData.apiKey}
              onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
              placeholder="Sua API Key"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiSecret">API Secret *</Label>
            <Input
              id="apiSecret"
              type="password"
              value={formData.apiSecret}
              onChange={(e) => setFormData(prev => ({ ...prev, apiSecret: e.target.value }))}
              placeholder="Seu API Secret"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="passphrase">Passphrase *</Label>
            <Input
              id="passphrase"
              type="password"
              value={formData.passphrase}
              onChange={(e) => setFormData(prev => ({ ...prev, passphrase: e.target.value }))}
              placeholder="Sua Passphrase"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="network">Network</Label>
            <select
              id="network"
              value={formData.network}
              onChange={(e) => setFormData(prev => ({ ...prev, network: e.target.value as 'mainnet' | 'testnet' }))}
              className="w-full p-2 border rounded-md"
              disabled={loading}
            >
              <option value="testnet">Testnet</option>
              <option value="mainnet">Mainnet</option>
            </select>
          </div>

          {(type === 'shadow' || type === 'slave') && (
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade *</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                placeholder="Quantidade para trades"
                disabled={loading}
                min="0"
                step="0.01"
              />
            </div>
          )}

          {type === 'shadow' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="take_profit">Take Profit (opcional)</Label>
                <Input
                  id="take_profit"
                  type="number"
                  value={formData.take_profit}
                  onChange={(e) => setFormData(prev => ({ ...prev, take_profit: Number(e.target.value) }))}
                  placeholder="Valor de take profit"
                  disabled={loading}
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="shadow_close"
                    checked={formData.shadow_close}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, shadow_close: checked }))}
                    disabled={loading}
                  />
                  <Label htmlFor="shadow_close">Shadow Close</Label>
                </div>
                <p className="text-xs text-gray-500">
                  Fechar automaticamente quando Owner fechar
                </p>
              </div>
            </>
          )}
        </div>

        <div className="flex space-x-2">
          <Button
            onClick={() => handleSubmit(type)}
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Configurando...' : 'Configurar Conta'}
          </Button>
          <Button
            variant="outline"
            onClick={resetForm}
            disabled={loading}
          >
            Limpar
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/dashboard')}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Voltar</span>
                </Button>
                <h1 className="text-2xl font-bold text-gray-900">
                  Gerenciar Contas
                </h1>
              </div>
              
              <div className="text-sm text-gray-600">
                {user?.email}
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="owner">Owner</TabsTrigger>
              <TabsTrigger value="shadow">Shadow</TabsTrigger>
              <TabsTrigger value="slave">Slave</TabsTrigger>
            </TabsList>

            <TabsContent value="owner" className="space-y-4">
              {ownerAccount ? (
                <AccountCard
                  account={ownerAccount}
                  type="owner"
                  onDelete={() => handleDelete('owner')}
                />
              ) : (
                <AccountForm type="owner" />
              )}
            </TabsContent>

            <TabsContent value="shadow" className="space-y-4">
              {shadowAccount ? (
                <AccountCard
                  account={shadowAccount}
                  type="shadow"
                  onDelete={() => handleDelete('shadow')}
                />
              ) : (
                <AccountForm type="shadow" />
              )}
            </TabsContent>

            <TabsContent value="slave" className="space-y-4">
              {slaveAccount ? (
                <AccountCard
                  account={slaveAccount}
                  type="slave"
                  onDelete={() => handleDelete('slave')}
                />
              ) : (
                <AccountForm type="slave" />
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ProtectedRoute>
  );
} 