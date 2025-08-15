import React, { useState, useEffect, useMemo, useCallback, Suspense, lazy } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  CalendarIcon,
  UserGroupIcon,
  CheckIcon,
  DocumentTextIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { campaignService } from '../services/campaignService';
import { workflowService } from '../services/workflowService';
import { matchingService } from '../services/matchingService';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

// Lazy load heavy components
const LazyWorkflowProgress = lazy(() => import('../components/ui/LazyWorkflowProgress'));
const LazyMatchingCriteria = lazy(() => import('../components/ui/LazyMatchingCriteria'));

// Loading component for lazy sections
const SectionSkeleton = ({ height = "h-32" }) => (
  <div className={`bg-white rounded-xl border border-warmGray-200 p-4 sm:p-6 shadow-md ${height}`}>
    <div className="animate-pulse space-y-4">
      <div className="h-6 bg-warmGray-200 rounded w-1/3"></div>
      <div className="h-4 bg-warmGray-200 rounded w-2/3"></div>
      <div className="h-4 bg-warmGray-200 rounded w-1/2"></div>
    </div>
  </div>
);

// Compact table row component with lazy loading
const PairTableRow = React.memo(({ pair, index, onVisible }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [ref, inView] = useIntersectionObserver({
    threshold: 0.1,
    triggerOnce: true
  });

  useEffect(() => {
    if (inView && !isVisible) {
      setIsVisible(true);
      onVisible && onVisible(index);
    }
  }, [inView, isVisible, index, onVisible]);

  if (!isVisible) {
    return (
      <tr ref={ref} className="animate-pulse">
        <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-sm border-b border-warmGray-200">
          <div className="h-4 bg-warmGray-200 rounded w-6"></div>
        </td>
        <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-sm border-b border-warmGray-200">
          <div className="h-4 bg-warmGray-200 rounded w-20"></div>
        </td>
        <td className="hidden sm:table-cell px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-sm border-b border-warmGray-200">
          <div className="h-4 bg-warmGray-200 rounded w-32"></div>
        </td>
        <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-sm border-b border-warmGray-200">
          <div className="h-4 bg-warmGray-200 rounded w-20"></div>
        </td>
        <td className="hidden sm:table-cell px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-sm border-b border-warmGray-200">
          <div className="h-4 bg-warmGray-200 rounded w-32"></div>
        </td>
      </tr>
    );
  }

  const getEmployeeName = (employee, fallbackId) => {
    return employee?.name || employee?.full_name || `Employee ${fallbackId || 'N/A'}`;
  };

  const getEmployeeEmail = (employee) => {
    return employee?.email || 'N/A';
  };

  const employee1 = pair.employee_1 || pair.employee1;
  const employee2 = pair.employee_2 || pair.employee2;
  const employee1Name = getEmployeeName(employee1, pair.employee1_id || pair.employee_1_id);
  const employee2Name = getEmployeeName(employee2, pair.employee2_id || pair.employee_2_id);
  const employee1Email = getEmployeeEmail(employee1);
  const employee2Email = getEmployeeEmail(employee2);

  return (
    <tr ref={ref} className="hover:bg-warmGray-50 transition-colors">
      <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium text-warmGray-500 border-b border-warmGray-200">
        {index + 1}
      </td>
      <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-sm sm:text-base border-b border-warmGray-200">
        <div className="font-medium text-warmGray-900 truncate max-w-[120px] sm:max-w-none">
          {employee1Name}
        </div>
        {employee1?.department && (
          <div className="text-xs sm:text-sm text-warmGray-500 truncate hidden sm:block">
            {employee1.department}
          </div>
        )}
        <div className="text-xs sm:text-sm text-warmGray-600 sm:hidden truncate">
          {employee1Email}
        </div>
      </td>
      <td className="hidden sm:table-cell px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-sm sm:text-base text-warmGray-600 border-b border-warmGray-200 max-w-[200px] truncate">
        {employee1Email}
      </td>
      <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-sm sm:text-base border-b border-warmGray-200">
        <div className="font-medium text-warmGray-900 truncate max-w-[120px] sm:max-w-none">
          {employee2Name}
        </div>
        {employee2?.department && (
          <div className="text-xs sm:text-sm text-warmGray-500 truncate hidden sm:block">
            {employee2.department}
          </div>
        )}
        <div className="text-xs sm:text-sm text-warmGray-600 sm:hidden truncate">
          {employee2Email}
        </div>
      </td>
      <td className="hidden sm:table-cell px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-sm sm:text-base text-warmGray-600 border-b border-warmGray-200 max-w-[200px] truncate">
        {employee2Email}
      </td>
    </tr>
  );
});

const CampaignHistory = () => {
  const { id: campaignId } = useParams();
  const navigate = useNavigate();
  
  const [campaign, setCampaign] = useState(null);
  const [workflowState, setWorkflowState] = useState(null);
  const [pairsData, setPairsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visiblePairs, setVisiblePairs] = useState(8); // Reduced for mobile

  useEffect(() => {
    const loadCampaignHistory = async () => {
      try {
        setLoading(true);
        
        const campaignResponse = await campaignService.getCampaign(campaignId);
        console.log('🔍 Campaign Response Debug:', campaignResponse);
        
        if (campaignResponse.success) {
          const campaignData = campaignResponse.data;
          console.log('🔍 Campaign Data Debug:', campaignData);
          console.log('🔍 Start Date:', campaignData?.start_date);
          console.log('🔍 End Date:', campaignData?.end_date);
          setCampaign(campaignData);
        } else {
          console.error('❌ Failed to fetch campaign:', campaignResponse.error);
          setError('Failed to load campaign details');
        }
        
        const workflowData = await workflowService.getCampaignWorkflowStatus(campaignId);
        setWorkflowState(workflowData);
        
        try {
          const pairsHistory = await matchingService.getMatchingHistory(campaignId);
          if (pairsHistory.pairs && pairsHistory.pairs.length > 0) {
            setPairsData(pairsHistory);
          } else {
            const step4Data = workflowData.step_data['4'];
            if (step4Data && step4Data.pairs) {
              setPairsData({
                pairs: step4Data.pairs,
                pairs_count: step4Data.pairs_count || step4Data.pairs.length,
                total_possible: step4Data.total_possible || 0,
                criteria_used: step4Data.criteria_used || []
              });
            }
          }
        } catch (pairsError) {
          console.warn('Could not load pairs data:', pairsError);
          const step4Data = workflowData.step_data['4'];
          if (step4Data && step4Data.pairs) {
            setPairsData({
              pairs: step4Data.pairs,
              pairs_count: step4Data.pairs_count || step4Data.pairs.length,
              total_possible: step4Data.total_possible || 0,
              criteria_used: step4Data.criteria_used || []
            });
          }
        }
        
      } catch (err) {
        setError(err.message || 'Failed to load campaign history');
      } finally {
        setLoading(false);
      }
    };

    if (campaignId) {
      loadCampaignHistory();
    }
  }, [campaignId]);

  const handleBackToCampaigns = useCallback(() => {
    navigate('/app/campaigns');
  }, [navigate]);

  const handlePairVisible = useCallback((index) => {
    if (index >= visiblePairs - 3) {
      setVisiblePairs(prev => Math.min(prev + 8, pairsData?.pairs?.length || 0));
    }
  }, [visiblePairs, pairsData?.pairs?.length]);

  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }, []);

  const campaignDates = useMemo(() => {
    console.log('🔍 Campaign Dates Debug:', {
      campaign: campaign,
      start_date: campaign?.start_date,
      end_date: campaign?.end_date,
      typeof_start: typeof campaign?.start_date,
      typeof_end: typeof campaign?.end_date
    });
    
    if (!campaign?.start_date || !campaign?.end_date) {
      console.log('❌ Missing campaign dates');
      return { start: 'N/A', end: 'N/A' };
    }
    
    try {
      const formattedStart = formatDate(campaign.start_date);
      const formattedEnd = formatDate(campaign.end_date);
      console.log('✅ Formatted dates:', { start: formattedStart, end: formattedEnd });
      return {
        start: formattedStart,
        end: formattedEnd
      };
    } catch (error) {
      console.error('❌ Error formatting dates:', error);
      return { start: 'Invalid Date', end: 'Invalid Date' };
    }
  }, [campaign?.start_date, campaign?.end_date, formatDate]);

  const completedSteps = workflowState?.completed_steps?.length || 0;

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12 sm:py-16 lg:py-20">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-[#8B6F47]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 sm:p-8 lg:p-10 text-center">
            <p className="text-red-600 text-base sm:text-lg lg:text-xl mb-4">{error}</p>
            <button
              onClick={handleBackToCampaigns}
              className="bg-[#E8C4A0] hover:bg-[#DDB892] text-[#8B6F47] font-medium py-3 px-6 sm:py-3 sm:px-8 lg:py-4 lg:px-10 rounded-lg transition-all duration-200 text-base sm:text-lg"
            >
              Retour aux Campagnes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 lg:space-y-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 lg:gap-6">
          <button
            onClick={handleBackToCampaigns}
            className="flex items-center space-x-2 text-warmGray-600 hover:text-warmGray-800 transition-colors duration-200 self-start group"
          >
            <ArrowLeftIcon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 group-hover:transform group-hover:-translate-x-1 transition-transform" />
            <span className="text-base sm:text-lg lg:text-xl font-medium">Retour aux Campagnes</span>
          </button>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <div className="flex items-center space-x-3">
              <DocumentTextIcon className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-[#E8C4A0]" />
              <span className="text-warmGray-800 font-semibold text-lg sm:text-xl lg:text-2xl">Historique de Campagne</span>
            </div>
            <button
              onClick={() => navigate(`/app/campaigns/${campaignId}/evaluations`)}
              className="bg-[#E8C4A0] hover:bg-[#DDB892] text-[#8B6F47] font-medium py-3 px-4 sm:px-6 lg:px-8 rounded-lg transition-all duration-200 flex items-center space-x-2 text-base sm:text-lg shadow-sm hover:shadow-md"
            >
              <ChartBarIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              <span>Voir les Évaluations</span>
            </button>
          </div>
        </div>

        {/* Campaign Info Card */}
        <div className="bg-white rounded-xl border border-warmGray-200 p-6 sm:p-8 lg:p-10 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-warmGray-900 truncate">
              {campaign?.title || 'Campaign Details'}
            </h2>
            <span className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 text-sm sm:text-base lg:text-lg font-semibold rounded-full self-start sm:self-auto shadow-sm">
              <CheckIcon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 mr-2" />
              Terminée
            </span>
          </div>
          
          {campaign?.description && (
            <p className="text-warmGray-600 mb-6 text-base sm:text-lg lg:text-xl leading-relaxed line-clamp-3">{campaign.description}</p>
          )}
          
          {/* Statistics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-4 sm:p-6 lg:p-8 text-center hover:shadow-lg transition-shadow">
              <CalendarIcon className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-blue-600 mx-auto mb-3" />
              <p className="text-base sm:text-xl lg:text-2xl font-bold text-warmGray-800 break-words">
                {campaignDates.start} - {campaignDates.end}
              </p>
              <p className="text-sm sm:text-base lg:text-lg text-warmGray-600 font-medium">Période de Campagne</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 p-4 sm:p-6 lg:p-8 text-center hover:shadow-lg transition-shadow">
              <UserGroupIcon className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-green-600 mx-auto mb-3" />
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-warmGray-800">
                {workflowState?.step_data?.['2']?.employees_count || campaign?.employees_count || 0}
              </p>
              <p className="text-sm sm:text-base lg:text-lg text-warmGray-600 font-medium">Participants</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 p-4 sm:p-6 lg:p-8 text-center hover:shadow-lg transition-shadow">
              <DocumentTextIcon className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-purple-600 mx-auto mb-3" />
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-warmGray-800">
                {pairsData?.pairs_count || pairsData?.pairs?.length || 0}
              </p>
              <p className="text-sm sm:text-base lg:text-lg text-warmGray-600 font-medium">Paires Créées</p>
            </div>
          </div>
        </div>

        {/* Lazy Loaded Workflow Progress */}
        <Suspense fallback={<SectionSkeleton height="h-48 sm:h-56 lg:h-64" />}>
          <LazyWorkflowProgress workflowState={workflowState} completedSteps={completedSteps} />
        </Suspense>

        {/* Employee Pairs Table */}
        {pairsData && pairsData.pairs && pairsData.pairs.length > 0 && (
          <div className="bg-white rounded-xl border border-warmGray-200 shadow-lg overflow-hidden">
            <div className="px-6 sm:px-8 lg:px-10 py-4 sm:py-6 lg:py-8 border-b border-warmGray-200 bg-gradient-to-r from-warmGray-50 to-warmGray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-warmGray-900">
                  Employee Pairs ({pairsData.pairs.length})
                </h3>
                <div className="text-sm sm:text-base lg:text-lg text-warmGray-600 font-medium">
                  Showing {Math.min(visiblePairs, pairsData.pairs.length)} of {pairsData.pairs.length}
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-warmGray-50">
                  <tr>
                    <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-warmGray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-warmGray-500 uppercase tracking-wider">
                      Employee 1
                    </th>
                    <th className="hidden sm:table-cell px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-warmGray-500 uppercase tracking-wider">
                      Email 1
                    </th>
                    <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-warmGray-500 uppercase tracking-wider">
                      Employee 2
                    </th>
                    <th className="hidden sm:table-cell px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-warmGray-500 uppercase tracking-wider">
                      Email 2
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {pairsData.pairs.slice(0, visiblePairs).map((pair, index) => (
                    <PairTableRow
                      key={index}
                      pair={pair}
                      index={index}
                      onVisible={handlePairVisible}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            
            {visiblePairs < pairsData.pairs.length && (
              <div className="px-6 sm:px-8 lg:px-10 py-4 sm:py-6 lg:py-8 border-t border-warmGray-200 text-center bg-warmGray-50">
                <button
                  onClick={() => setVisiblePairs(prev => Math.min(prev + 8, pairsData.pairs.length))}
                  className="bg-[#E8C4A0] hover:bg-[#DDB892] text-[#8B6F47] font-semibold py-3 px-6 sm:px-8 lg:px-10 rounded-lg transition-all duration-200 text-base sm:text-lg shadow-md hover:shadow-lg"
                >
                  Load More ({pairsData.pairs.length - visiblePairs} remaining)
                </button>
              </div>
            )}
          </div>
        )}

        {/* Lazy Loaded Matching Criteria */}
        {pairsData?.criteria_used && pairsData.criteria_used.length > 0 && (
          <Suspense fallback={<SectionSkeleton />}>
            <LazyMatchingCriteria criteria={pairsData.criteria_used} />
          </Suspense>
        )}
      </div>
    </div>
  );
};

export default CampaignHistory;
