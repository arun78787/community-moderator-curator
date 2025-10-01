import React, { useState, useEffect } from 'react';
import { Settings, Users, Shield, Sliders, Save, AlertCircle, CheckCircle, Plus, X, CreditCard as Edit } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

interface CommunityRule {
  id: string;
  category: string;
  threshold: number;
  action: 'flag' | 'auto_remove';
  enabled: boolean;
}

interface CommunitySettings {
  name: string;
  description: string;
  auto_remove_threshold: number;
  flag_review_threshold: number;
  allow_anonymous_posts: boolean;
  require_approval: boolean;
  max_post_length: number;
  allowed_file_types: string[];
}

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('settings');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<CommunitySettings>({
    name: 'Community Moderator',
    description: 'A safe space for community discussion',
    auto_remove_threshold: 0.9,
    flag_review_threshold: 0.6,
    allow_anonymous_posts: false,
    require_approval: false,
    max_post_length: 2000,
    allowed_file_types: ['jpg', 'jpeg', 'png', 'gif'],
  });
  
  const [rules, setRules] = useState<CommunityRule[]>([
    { id: '1', category: 'spam', threshold: 0.8, action: 'auto_remove', enabled: true },
    { id: '2', category: 'harassment', threshold: 0.7, action: 'flag', enabled: true },
    { id: '3', category: 'hate_speech', threshold: 0.6, action: 'flag', enabled: true },
    { id: '4', category: 'violence', threshold: 0.8, action: 'auto_remove', enabled: true },
    { id: '5', category: 'nudity', threshold: 0.9, action: 'auto_remove', enabled: true },
  ]);

  const [editingRule, setEditingRule] = useState<string | null>(null);
  const [users] = useState([
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'user', status: 'active' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'moderator', status: 'active' },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'user', status: 'suspended' },
  ]);

  const { register, handleSubmit, formState: { errors } } = useForm<CommunitySettings>({
    defaultValues: settings,
  });

  const tabs = [
    { id: 'settings', label: 'General Settings', icon: Settings },
    { id: 'rules', label: 'Moderation Rules', icon: Shield },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'ai', label: 'AI Configuration', icon: Sliders },
  ];

  const onSubmitSettings = async (data: CommunitySettings) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSettings(data);
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const updateRule = (id: string, updates: Partial<CommunityRule>) => {
    setRules(rules.map(rule => 
      rule.id === id ? { ...rule, ...updates } : rule
    ));
    setEditingRule(null);
    toast.success('Rule updated successfully');
  };

  const addRule = () => {
    const newRule: CommunityRule = {
      id: Date.now().toString(),
      category: 'other',
      threshold: 0.7,
      action: 'flag',
      enabled: true,
    };
    setRules([...rules, newRule]);
    setEditingRule(newRule.id);
  };

  const removeRule = (id: string) => {
    setRules(rules.filter(rule => rule.id !== id));
    toast.success('Rule removed successfully');
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      spam: 'Spam',
      harassment: 'Harassment',
      hate_speech: 'Hate Speech',
      violence: 'Violence',
      nudity: 'Nudity/Sexual Content',
      misinformation: 'Misinformation',
      copyright: 'Copyright Violation',
      other: 'Other',
    };
    return labels[category] || category;
  };

  const getActionColor = (action: string) => {
    return action === 'auto_remove' ? 'text-error-600 bg-error-100' : 'text-warning-600 bg-warning-100';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'text-success-600 bg-success-100',
      suspended: 'text-error-600 bg-error-100',
      pending: 'text-warning-600 bg-warning-100',
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'text-purple-600 bg-purple-100',
      moderator: 'text-primary-600 bg-primary-100',
      user: 'text-gray-600 bg-gray-100',
    };
    return colors[role] || 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Admin Panel
        </h1>
        <p className="text-gray-600">
          Manage community settings and moderation rules
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* General Settings */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Community Settings</h3>
              
              <form onSubmit={handleSubmit(onSubmitSettings)} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Community Name
                  </label>
                  <input
                    {...register('name', { required: 'Community name is required' })}
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  {errors.name && (
                    <p className="mt-2 text-sm text-error-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="auto_remove_threshold" className="block text-sm font-medium text-gray-700 mb-2">
                      Auto-Remove Threshold
                    </label>
                    <input
                      {...register('auto_remove_threshold', { 
                        valueAsNumber: true,
                        min: { value: 0, message: 'Must be at least 0' },
                        max: { value: 1, message: 'Must be at most 1' }
                      })}
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      AI confidence threshold for automatic removal (0-1)
                    </p>
                  </div>

                  <div>
                    <label htmlFor="flag_review_threshold" className="block text-sm font-medium text-gray-700 mb-2">
                      Flag Review Threshold
                    </label>
                    <input
                      {...register('flag_review_threshold', { 
                        valueAsNumber: true,
                        min: { value: 0, message: 'Must be at least 0' },
                        max: { value: 1, message: 'Must be at most 1' }
                      })}
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      AI confidence threshold for flagging content (0-1)
                    </p>
                  </div>
                </div>

                <div>
                  <label htmlFor="max_post_length" className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Post Length
                  </label>
                  <input
                    {...register('max_post_length', { 
                      valueAsNumber: true,
                      min: { value: 1, message: 'Must be at least 1' }
                    })}
                    type="number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Maximum number of characters allowed in posts
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      {...register('allow_anonymous_posts')}
                      type="checkbox"
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <label className="ml-3 text-sm font-medium text-gray-700">
                      Allow anonymous posts
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      {...register('require_approval')}
                      type="checkbox"
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <label className="ml-3 text-sm font-medium text-gray-700">
                      Require approval for new posts
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Moderation Rules */}
          {activeTab === 'rules' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Moderation Rules</h3>
                <button
                  onClick={addRule}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Rule</span>
                </button>
              </div>

              <div className="space-y-4">
                {rules.map((rule) => (
                  <div key={rule.id} className="bg-gray-50 rounded-lg p-4">
                    {editingRule === rule.id ? (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <select
                            value={rule.category}
                            onChange={(e) => updateRule(rule.id, { category: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          >
                            <option value="spam">Spam</option>
                            <option value="harassment">Harassment</option>
                            <option value="hate_speech">Hate Speech</option>
                            <option value="violence">Violence</option>
                            <option value="nudity">Nudity/Sexual</option>
                            <option value="misinformation">Misinformation</option>
                            <option value="copyright">Copyright</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        
                        <div>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="1"
                            value={rule.threshold}
                            onChange={(e) => updateRule(rule.id, { threshold: parseFloat(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>
                        
                        <div>
                          <select
                            value={rule.action}
                            onChange={(e) => updateRule(rule.id, { action: e.target.value as 'flag' | 'auto_remove' })}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          >
                            <option value="flag">Flag for Review</option>
                            <option value="auto_remove">Auto Remove</option>
                          </select>
                        </div>
                        
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setEditingRule(null)}
                            className="p-2 text-success-600 hover:bg-success-50 rounded transition-colors duration-200"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => removeRule(rule.id)}
                            className="p-2 text-error-600 hover:bg-error-50 rounded transition-colors duration-200"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={rule.enabled}
                              onChange={(e) => updateRule(rule.id, { enabled: e.target.checked })}
                              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                            />
                            <span className="font-medium text-gray-900">{getCategoryLabel(rule.category)}</span>
                          </div>
                          
                          <span className="text-sm text-gray-600">
                            Threshold: {Math.round(rule.threshold * 100)}%
                          </span>
                          
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(rule.action)}`}>
                            {rule.action === 'auto_remove' ? 'Auto Remove' : 'Flag for Review'}
                          </span>
                        </div>
                        
                        <button
                          onClick={() => setEditingRule(rule.id)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors duration-200"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Rule Configuration Tips</h4>
                    <ul className="mt-2 text-sm text-blue-700 space-y-1">
                      <li>• Lower thresholds (0.3-0.5) will flag more content but may increase false positives</li>
                      <li>• Higher thresholds (0.7-0.9) will be more selective but may miss some violations</li>
                      <li>• Auto-remove rules should have higher thresholds to avoid removing legitimate content</li>
                      <li>• Consider starting with flag-for-review actions and adjusting based on results</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* User Management */}
          {activeTab === 'users' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                <div className="flex items-center space-x-4">
                  <input
                    type="search"
                    placeholder="Search users..."
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getRoleColor(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(user.status)}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center space-x-2">
                            <button className="text-primary-600 hover:text-primary-700">Edit</button>
                            <span className="text-gray-300">|</span>
                            {user.status === 'active' ? (
                              <button className="text-error-600 hover:text-error-700">Suspend</button>
                            ) : (
                              <button className="text-success-600 hover:text-success-700">Activate</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* AI Configuration */}
          {activeTab === 'ai' && (
            <div className="max-w-2xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">AI Configuration</h3>
              
              <div className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-900">API Configuration Required</h4>
                      <p className="mt-1 text-sm text-yellow-700">
                        Configure your AI provider API keys in the environment variables to enable automated content moderation.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Text Analysis Provider
                  </label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                    <option value="openai">OpenAI GPT-4</option>
                    <option value="google">Google Cloud Natural Language</option>
                    <option value="aws">AWS Comprehend</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image Analysis Provider
                  </label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                    <option value="openai">OpenAI GPT-4V</option>
                    <option value="google">Google Cloud Vision</option>
                    <option value="aws">AWS Rekognition</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Analysis Options</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <label className="ml-3 text-sm text-gray-700">
                        Enable sentiment analysis
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <label className="ml-3 text-sm text-gray-700">
                        Enable toxicity detection
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <label className="ml-3 text-sm text-gray-700">
                        Enable image content classification
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <label className="ml-3 text-sm text-gray-700">
                        Save analysis data for model training
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Analysis Timeout (seconds)
                    </label>
                    <input
                      type="number"
                      defaultValue="30"
                      min="5"
                      max="120"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Retry Attempts
                    </label>
                    <input
                      type="number"
                      defaultValue="3"
                      min="1"
                      max="5"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end pt-6 border-t border-gray-200">
                  <button className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200">
                    <Save className="w-5 h-5" />
                    <span>Save Configuration</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;