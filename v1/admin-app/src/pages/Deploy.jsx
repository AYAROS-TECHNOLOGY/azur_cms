import React, { useState } from 'react';

const DeployScreen = () => {
  // État pour le fournisseur sélectionné
  const [selectedProvider, setSelectedProvider] = useState('aws');
  
  // État pour les configurations par fournisseur
  const [providerConfigs, setProviderConfigs] = useState({
    aws: {
      region: 'eu-west-1',
      bucketName: 'mon-site-statique',
      accessKeyId: '',
      secretAccessKey: '',
      distributionId: ''
    },
    azure: {
      resourceGroup: 'mon-groupe-ressources',
      storageName: 'monsitestatique',
      location: 'westeurope',
      subscriptionId: '',
      clientId: '',
      clientSecret: ''
    },
    netlify: {
      teamName: 'mon-equipe',
      siteName: 'mon-site-statique',
      token: ''
    }
  });
  
  // État pour l'historique des déploiements
  const [deployments, setDeployments] = useState([
    {
      id: 1,
      provider: 'aws',
      status: 'success',
      date: '22 Mars 2025 - 15:30',
      url: 'https://mon-site-statique.s3-website.eu-west-1.amazonaws.com',
      details: 'Déploiement réussi en 45 secondes'
    },
    {
      id: 2,
      provider: 'netlify',
      status: 'error',
      date: '21 Mars 2025 - 10:15',
      url: 'https://mon-site-statique.netlify.app',
      details: 'Erreur lors du déploiement: Token invalide'
    },
    {
      id: 3,
      provider: 'azure',
      status: 'success',
      date: '20 Mars 2025 - 09:30',
      url: 'https://monsitestatique.z6.web.core.windows.net',
      details: 'Déploiement réussi en 1 minute 20 secondes'
    }
  ]);
  
  // État pour le déploiement en cours
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentProgress, setDeploymentProgress] = useState(0);
  const [deploymentStatus, setDeploymentStatus] = useState(null);
  
  // Mise à jour de la configuration
  const updateConfig = (provider, key, value) => {
    setProviderConfigs({
      ...providerConfigs,
      [provider]: {
        ...providerConfigs[provider],
        [key]: value
      }
    });
  };
  
  // Fonction de déploiement
  const handleDeploy = () => {
    // Simuler un déploiement
    setIsDeploying(true);
    setDeploymentStatus('pending');
    setDeploymentProgress(0);
    
    // Simulation de progression
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setDeploymentProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        setIsDeploying(false);
        
        // Simuler un succès ou échec aléatoire
        const isSuccess = Math.random() > 0.2;
        setDeploymentStatus(isSuccess ? 'success' : 'error');
        
        // Ajouter au historique
        if (isSuccess) {
          const newDeployment = {
            id: deployments.length + 1,
            provider: selectedProvider,
            status: 'success',
            date: new Date().toLocaleString('fr-FR'),
            url: selectedProvider === 'aws' 
              ? `https://${providerConfigs.aws.bucketName}.s3-website.${providerConfigs.aws.region}.amazonaws.com`
              : selectedProvider === 'azure'
                ? `https://${providerConfigs.azure.storageName}.z6.web.core.windows.net`
                : `https://${providerConfigs.netlify.siteName}.netlify.app`,
            details: `Déploiement réussi en ${Math.floor(Math.random() * 60) + 30} secondes`
          };
          
          setDeployments([newDeployment, ...deployments]);
        } else {
          const newDeployment = {
            id: deployments.length + 1,
            provider: selectedProvider,
            status: 'error',
            date: new Date().toLocaleString('fr-FR'),
            url: '',
            details: 'Erreur lors du déploiement: Vérifiez les logs pour plus de détails'
          };
          
          setDeployments([newDeployment, ...deployments]);
        }
      }
    }, 300);
  };

  return (
    <div className="p-6 max-w-full mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Déploiement</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration de déploiement */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Configuration du déploiement</h2>
            
            {/* Sélection du fournisseur */}
            <div className="mb-6">
              <label className="block text-sm text-gray-500 mb-2">Fournisseur de déploiement</label>
              <div className="grid grid-cols-3 gap-4">
                <button 
                  className={`p-4 border rounded flex flex-col items-center ${
                    selectedProvider === 'aws' ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedProvider('aws')}
                >
                  <div className="text-3xl mb-2">☁️</div>
                  <div className="font-medium">AWS</div>
                </button>
                
                <button 
                  className={`p-4 border rounded flex flex-col items-center ${
                    selectedProvider === 'azure' ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedProvider('azure')}
                >
                  <div className="text-3xl mb-2">☁️</div>
                  <div className="font-medium">Azure</div>
                </button>
                
                <button 
                  className={`p-4 border rounded flex flex-col items-center ${
                    selectedProvider === 'netlify' ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedProvider('netlify')}
                >
                  <div className="text-3xl mb-2">🌐</div>
                  <div className="font-medium">Netlify</div>
                </button>
              </div>
            </div>
            
            {/* Configuration AWS */}
            {selectedProvider === 'aws' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Région</label>
                    <select 
                      value={providerConfigs.aws.region}
                      onChange={(e) => updateConfig('aws', 'region', e.target.value)}
                      className="w-full px-3 py-2 border rounded"
                    >
                      <option value="us-east-1">US East (N. Virginia)</option>
                      <option value="us-west-1">US West (N. California)</option>
                      <option value="eu-west-1">EU (Ireland)</option>
                      <option value="eu-central-1">EU (Frankfurt)</option>
                      <option value="ap-northeast-1">Asia Pacific (Tokyo)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Nom du bucket S3</label>
                    <input 
                      type="text"
                      value={providerConfigs.aws.bucketName}
                      onChange={(e) => updateConfig('aws', 'bucketName', e.target.value)}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Access Key ID</label>
                    <input 
                      type="text"
                      value={providerConfigs.aws.accessKeyId}
                      onChange={(e) => updateConfig('aws', 'accessKeyId', e.target.value)}
                      className="w-full px-3 py-2 border rounded"
                      placeholder="AKIAXXXXXXXXXXXXXXXX"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Secret Access Key</label>
                    <input 
                      type="password"
                      value={providerConfigs.aws.secretAccessKey}
                      onChange={(e) => updateConfig('aws', 'secretAccessKey', e.target.value)}
                      className="w-full px-3 py-2 border rounded"
                      placeholder="••••••••••••••••••••"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-500 mb-1">CloudFront Distribution ID (optionnel)</label>
                  <input 
                    type="text"
                    value={providerConfigs.aws.distributionId}
                    onChange={(e) => updateConfig('aws', 'distributionId', e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="E1XXXXXXXXXXXX"
                  />
                </div>
              </div>
            )}
            
            {/* Configuration Azure */}
            {selectedProvider === 'azure' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Resource Group</label>
                    <input 
                      type="text"
                      value={providerConfigs.azure.resourceGroup}
                      onChange={(e) => updateConfig('azure', 'resourceGroup', e.target.value)}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Storage Account Name</label>
                    <input 
                      type="text"
                      value={providerConfigs.azure.storageName}
                      onChange={(e) => updateConfig('azure', 'storageName', e.target.value)}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Location</label>
                    <select 
                      value={providerConfigs.azure.location}
                      onChange={(e) => updateConfig('azure', 'location', e.target.value)}
                      className="w-full px-3 py-2 border rounded"
                    >
                      <option value="westeurope">West Europe</option>
                      <option value="northeurope">North Europe</option>
                      <option value="eastus">East US</option>
                      <option value="westus">West US</option>
                      <option value="southeastasia">Southeast Asia</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Subscription ID</label>
                    <input 
                      type="text"
                      value={providerConfigs.azure.subscriptionId}
                      onChange={(e) => updateConfig('azure', 'subscriptionId', e.target.value)}
                      className="w-full px-3 py-2 border rounded"
                      placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Client ID</label>
                    <input 
                      type="text"
                      value={providerConfigs.azure.clientId}
                      onChange={(e) => updateConfig('azure', 'clientId', e.target.value)}
                      className="w-full px-3 py-2 border rounded"
                      placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Client Secret</label>
                    <input 
                      type="password"
                      value={providerConfigs.azure.clientSecret}
                      onChange={(e) => updateConfig('azure', 'clientSecret', e.target.value)}
                      className="w-full px-3 py-2 border rounded"
                      placeholder="••••••••••••••••••••"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Configuration Netlify */}
            {selectedProvider === 'netlify' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Nom de l'équipe (optionnel)</label>
                    <input 
                      type="text"
                      value={providerConfigs.netlify.teamName}
                      onChange={(e) => updateConfig('netlify', 'teamName', e.target.value)}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Nom du site</label>
                    <input 
                      type="text"
                      value={providerConfigs.netlify.siteName}
                      onChange={(e) => updateConfig('netlify', 'siteName', e.target.value)}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Token API Netlify</label>
                  <input 
                    type="password"
                    value={providerConfigs.netlify.token}
                    onChange={(e) => updateConfig('netlify', 'token', e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="••••••••••••••••••••"
                  />
                </div>
              </div>
            )}
            
            {/* Zone de déploiement */}
            <div className="mt-6 pt-6 border-t">
              {/* Statut du déploiement */}
              {deploymentStatus && (
                <div className={`mb-4 p-4 rounded ${
                  deploymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  deploymentStatus === 'success' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {deploymentStatus === 'pending' && 'Déploiement en cours...'}
                  {deploymentStatus === 'success' && 'Déploiement réussi ! Le site est en ligne.'}
                  {deploymentStatus === 'error' && 'Erreur lors du déploiement. Vérifiez les logs pour plus de détails.'}
                </div>
              )}
              
              {/* Barre de progression */}
              {isDeploying && (
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${deploymentProgress}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 text-right">{deploymentProgress}%</div>
                </div>
              )}
              
              <div className="flex justify-end">
                <button 
                  onClick={handleDeploy}
                  disabled={isDeploying}
                  className={`bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded ${
                    isDeploying ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isDeploying ? 'Déploiement en cours...' : 'Déployer le site'}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Historique des déploiements */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Historique des déploiements</h2>
            
            <div className="space-y-4">
              {deployments.map(deployment => (
                <div 
                  key={deployment.id} 
                  className={`p-3 border rounded ${
                    deployment.status === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                        deployment.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                      }`}></span>
                      <span className="font-medium">
                        {deployment.provider === 'aws' ? 'AWS' : 
                         deployment.provider === 'azure' ? 'Azure' : 
                         'Netlify'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">{deployment.date}</div>
                  </div>
                  
                  {deployment.url && (
                    <div className="mb-2 truncate">
                      <a 
                        href={deployment.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline text-sm"
                      >
                        {deployment.url}
                      </a>
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-600">{deployment.details}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeployScreen;