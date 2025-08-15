import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  EyeIcon,
  StarIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  ChevronDownIcon,
  ChartBarIcon,
  LinkIcon,
  CheckCircleIcon,
  PlusIcon,
  ClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { dashboardService } from '../services/dashboardService';
import { SimpleBarChart, SimpleLineChart, EvaluationTrendsChart } from '../components/charts/SimpleChart';
import { SkeletonDashboard } from '../components/ui/Skeleton';

const DashboardModern = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);

  // Detect sidebar hover state from parent layout
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  // Memoize the callback to prevent recreation on every render
  const checkSidebarState = useCallback(() => {
    const mainContent = document.querySelector('[data-sidebar-hovered]');
    if (mainContent) {
      const isHovered = mainContent.getAttribute('data-sidebar-hovered') === 'true';
      setIsSidebarHovered(prevState => {
        // Only update if the state actually changed
        return prevState !== isHovered ? isHovered : prevState;
      });
    }
  }, []);

  useEffect(() => {
    // Check initially
    checkSidebarState();

    const mainContent = document.querySelector('[data-sidebar-hovered]');
    if (!mainContent) return;

    const observer = new MutationObserver(checkSidebarState);
    observer.observe(mainContent, {
      attributes: true,
      attributeFilter: ['data-sidebar-hovered']
    });

    return () => observer.disconnect();
  }, [checkSidebarState]);

  // Helper functions - memoized to prevent recreation
  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  }, []);

  const renderStars = useCallback((rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} className={index < rating ? 'text-yellow-400' : 'text-warmGray-300'}>
        ★
      </span>
    ));
  }, []);

  // Scroll functions for evaluations carousel - memoized to prevent recreation
  const scrollLeft = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  }, []);

  const scrollRight = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  }, []);

  const [isLoading, setIsLoading] = useState(true);

  // Dynamic data states
  const [dashboardStats, setDashboardStats] = useState(null);
  const [recentEvaluations, setRecentEvaluations] = useState([]);
  const [overallStats, setOverallStats] = useState(null);

  const [evaluationTrends, setEvaluationTrends] = useState([]);
  const [error, setError] = useState(null);

  // Données simulées pour le graphique - à remplacer par des données dynamiques
  const [dashboardData] = useState({
    totalCampaigns: 156,
    totalEmployees: 2847,
    totalReviews: 1203,
    chartData: [
      { day: 'M', value: 45 },
      { day: 'T', value: 52 },
      { day: 'W', value: 38 },
      { day: 'T', value: 61 },
      { day: 'F', value: 72 },
      { day: 'S', value: 58 },
      { day: 'S', value: 67 }
    ],
    recentReviews: [
      {
        id: 1,
        userName: 'Marie Dubois',
        avatar: 'MD',
        comment: 'Excellent coffee meeting experience! Really helped us connect with colleagues.',
        rating: 4.8,
        campaignName: 'Team Building Q4',
        timeAgo: '2 hours ago'
      },
      {
        id: 2,
        userName: 'Ahmed Hassan',
        avatar: 'AH',
        comment: 'Great platform for organizing coffee meetings. Very intuitive interface.',
        rating: 4.5,
        campaignName: 'New Employee Integration',
        timeAgo: '5 hours ago'
      },
      {
        id: 3,
        userName: 'Sophie Laurent',
        avatar: 'SL',
        comment: 'The matching algorithm works perfectly. Made meaningful connections.',
        rating: 5.0,
        campaignName: 'Cross-Department Mixer',
        timeAgo: '1 day ago'
      }
    ]
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load all dashboard data in parallel
        const [
          statsResponse,
          evaluationsResponse,
          trendsResponse
        ] = await Promise.all([
          dashboardService.getOverallEvaluationStats(),
          dashboardService.getRecentEvaluations(4),
          dashboardService.getEvaluationTrends()
        ]);

        if (statsResponse.success) {
          setDashboardStats(statsResponse.data);
        }

        if (evaluationsResponse.success) {
          setRecentEvaluations(evaluationsResponse.data);
        }

        if (trendsResponse.success) {
          console.log('Evaluation trends data:', trendsResponse.data);
          setEvaluationTrends(trendsResponse.data);
        }

      } catch (err) {
        console.error('Dashboard loading error:', err);
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (isLoading) {
    return <SkeletonDashboard />;
  }

  return (
    <div className="min-h-screen bg-cream p-2 sm:p-3 lg:p-3">

      <div className="max-w-7xl mx-auto space-y-3 sm:space-y-4 lg:space-y-6">
        
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-warmGray-800">Tableau de bord</h1>
            <p className="text-sm sm:text-base text-warmGray-600 mt-0.5">
              Bon retour, {user?.name || 'Utilisateur'} ! Voici un aperçu de votre plateforme.
            </p>
          </div>
        </div>

        {/* Actions rapides sur mobile / Statistiques sur desktop */}
        <div className="block sm:hidden mb-6">
          <h2 className="text-lg font-semibold text-warmGray-800 mb-4">Actions Rapides</h2>
          <div className="grid grid-cols-2 gap-4">
            {/* Créer Campagne */}
            <button
              onClick={() => navigate('/app/campaigns/create')}
              className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-warmGray-100/50 hover:border-peach-200 group hover:-translate-y-1 text-left"
            >
              <div className="flex flex-col space-y-3">
                <div className="w-12 h-12 bg-gradient-to-br from-peach-100 to-peach-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
                  <PlusIcon className="w-6 h-6 text-peach-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-warmGray-800 text-sm">Créer</h3>
                  <p className="text-xs text-warmGray-600">Nouvelle campagne</p>
                </div>
              </div>
            </button>

            {/* Voir Campagnes */}
            <button
              onClick={() => navigate('/app/campaigns')}
              className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-warmGray-100/50 hover:border-blue-200 group hover:-translate-y-1 text-left"
            >
              <div className="flex flex-col space-y-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
                  <ClipboardDocumentListIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-warmGray-800 text-sm">Campagnes</h3>
                  <p className="text-xs text-warmGray-600">Voir toutes</p>
                </div>
              </div>
            </button>

            {/* Employés */}
            <button
              onClick={() => navigate('/app/employees')}
              className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-warmGray-100/50 hover:border-amber-200 group hover:-translate-y-1 text-left"
            >
              <div className="flex flex-col space-y-3">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
                  <UserGroupIcon className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-warmGray-800 text-sm">Employés</h3>
                  <p className="text-xs text-warmGray-600">Gérer équipe</p>
                </div>
              </div>
            </button>

            {/* Historique */}
            <button
              onClick={() => navigate('/app/history')}
              className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-warmGray-100/50 hover:border-green-200 group hover:-translate-y-1 text-left"
            >
              <div className="flex flex-col space-y-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
                  <ClockIcon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-warmGray-800 text-sm">Historique</h3>
                  <p className="text-xs text-warmGray-600">Consulter</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Statistiques principales - Cachées sur mobile */}
        <div className={`hidden sm:grid gap-3 sm:gap-4 lg:gap-6 ${isSidebarHovered ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'} transition-all duration-300`}>
          {/* Total Campaigns */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl lg:rounded-3xl p-3 sm:p-4 lg:p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-warmGray-100/50 hover:border-peach-200 group hover:-translate-y-1">
            <div className="flex flex-col items-center text-center space-y-2 lg:space-y-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-peach-100 to-peach-200 rounded-lg lg:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
                <ClipboardDocumentListIcon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-7 lg:h-7 text-peach-600" />
              </div>
              <span className="text-xs sm:text-sm lg:text-sm font-bold text-warmGray-600 uppercase tracking-wider hidden sm:block">
                Campagnes
              </span>
              <div className="text-lg sm:text-xl lg:text-4xl font-bold text-warmGray-800 group-hover:text-peach-600 transition-colors duration-300">
                {dashboardStats?.total_campaigns?.toLocaleString() || '0'}
              </div>
            </div>
          </div>

          {/* Total Employees */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl lg:rounded-3xl p-3 sm:p-4 lg:p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-warmGray-100/50 hover:border-amber-200 group hover:-translate-y-1">
            <div className="flex flex-col items-center text-center space-y-2 lg:space-y-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg lg:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
                <UserGroupIcon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-7 lg:h-7 text-amber-600" />
              </div>
              <span className="text-xs sm:text-sm lg:text-sm font-bold text-warmGray-600 uppercase tracking-wider hidden sm:block">
                Employés
              </span>
              <div className="text-lg sm:text-xl lg:text-4xl font-bold text-warmGray-800 group-hover:text-amber-600 transition-colors duration-300">
                {dashboardStats?.total_employees?.toLocaleString() || '0'}
              </div>
            </div>
          </div>

          {/* Total Reviews */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl lg:rounded-3xl p-3 sm:p-4 lg:p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-warmGray-100/50 hover:border-orange-200 group hover:-translate-y-1">
            <div className="flex flex-col items-center text-center space-y-2 lg:space-y-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg lg:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
                <ChatBubbleLeftRightIcon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-7 lg:h-7 text-orange-600" />
              </div>
              <span className="text-xs sm:text-sm lg:text-sm font-bold text-warmGray-600 uppercase tracking-wider hidden sm:block">
                Évaluations
              </span>
              <div className="text-lg sm:text-xl lg:text-4xl font-bold text-warmGray-800 group-hover:text-orange-600 transition-colors duration-300">
                {dashboardStats?.total_evaluations?.toLocaleString() || '0'}
              </div>
            </div>
          </div>

          {/* Generated Pairs */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl lg:rounded-3xl p-3 sm:p-4 lg:p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-warmGray-100/50 hover:border-blue-200 group hover:-translate-y-1">
            <div className="flex flex-col items-center text-center space-y-2 lg:space-y-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg lg:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
                <LinkIcon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-7 lg:h-7 text-blue-600" />
              </div>
              <span className="text-xs sm:text-sm lg:text-sm font-bold text-warmGray-600 uppercase tracking-wider hidden sm:block">
                Paires
              </span>
              <div className="text-lg sm:text-xl lg:text-4xl font-bold text-warmGray-800 group-hover:text-blue-600 transition-colors duration-300">
                {dashboardStats?.total_pairs?.toLocaleString() || '0'}
              </div>
            </div>
          </div>

          {/* Completed Campaigns */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl lg:rounded-3xl p-3 sm:p-4 lg:p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-warmGray-100/50 hover:border-green-200 group hover:-translate-y-1">
            <div className="flex flex-col items-center text-center space-y-2 lg:space-y-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-lg lg:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
                <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-7 lg:h-7 text-green-600" />
              </div>
              <span className="text-xs sm:text-sm lg:text-sm font-bold text-warmGray-600 uppercase tracking-wider hidden sm:block">
                Terminées
              </span>
              <div className="text-lg sm:text-xl lg:text-4xl font-bold text-warmGray-800 group-hover:text-green-600 transition-colors duration-300">
                {dashboardStats?.completed_campaigns?.toLocaleString() || '0'}
              </div>
            </div>
          </div>
        </div>

        {/* Section principale avec graphique et statistiques */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">

          {/* Graphiques des évaluations */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tendances des évaluations */}
            <EvaluationTrendsChart
              data={evaluationTrends}
              title="Tendances des Évaluations dans le Temps"
            />
          </div>

          {/* Average Rating Card */}
          <div className="bg-blue-50/90 backdrop-blur-sm rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-sm border border-blue-200/50">
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <h2 className="text-lg lg:text-xl font-semibold text-warmGray-800">Note Moyenne</h2>
              <div className="bg-yellow-100 p-2 lg:p-3 rounded-full">
                <StarIcon className="h-5 w-5 lg:h-6 lg:w-6 text-yellow-600" />
              </div>
            </div>

            {dashboardStats ? (
              <div className="text-center">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-warmGray-800 mb-2">
                  {dashboardStats.average_rating ? dashboardStats.average_rating.toFixed(1) : '0.0'}
                </div>
                <div className="flex items-center justify-center mb-3 lg:mb-4">
                  {renderStars(Math.round(dashboardStats.average_rating || 0))}
                </div>

                <div className="grid grid-cols-2 gap-3 lg:gap-4 mt-3 lg:mt-4">
                  <div className="text-center">
                    <div className="text-xs sm:text-sm text-warmGray-600 mb-1">
                      Total Paires
                    </div>
                    <div className="text-lg lg:text-xl font-semibold text-warmGray-800">
                      {dashboardStats.total_pairs || 0}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs sm:text-sm text-warmGray-600 mb-1">
                      Évaluées
                    </div>
                    <div className="text-lg lg:text-xl font-semibold text-green-600">
                      {dashboardStats.total_evaluations || 0}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-warmGray-500 mt-3 lg:mt-4">
                  Basé sur {dashboardStats.total_evaluations || 0} évaluations
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <StarIcon className="h-12 w-12 text-warmGray-400 mx-auto mb-4" />
                <p className="text-warmGray-600">Chargement des statistiques...</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Evaluations - Horizontal Scrollable Cards */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-sm border border-warmGray-100/50 mt-6 lg:mt-8">
          <div className="mb-4 lg:mb-6">
            <h2 className="text-lg lg:text-xl font-semibold text-warmGray-800">Évaluations Récentes</h2>
          </div>

          {recentEvaluations && recentEvaluations.length > 0 ? (
            <div className="relative">
              {/* Left scroll button */}
              <button
                onClick={scrollLeft}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-white/90 shadow-lg hover:bg-white hover:shadow-xl transition-all duration-200 group border border-warmGray-200/50 hover:border-peach-200"
                style={{ marginLeft: '-20px' }}
              >
                <ChevronLeftIcon className="w-5 h-5 text-warmGray-600 group-hover:text-peach-600 transition-colors duration-200" />
              </button>

              {/* Right scroll button */}
              <button
                onClick={scrollRight}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-white/90 shadow-lg hover:bg-white hover:shadow-xl transition-all duration-200 group border border-warmGray-200/50 hover:border-peach-200"
                style={{ marginRight: '-20px' }}
              >
                <ChevronRightIcon className="w-5 h-5 text-warmGray-600 group-hover:text-peach-600 transition-colors duration-200" />
              </button>

              <div
                ref={scrollContainerRef}
                className="flex space-x-4 overflow-x-auto scrollbar-hide pb-2 px-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
              {recentEvaluations.map((evaluation, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-80 bg-gradient-to-br from-white to-warmGray-50/50 rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 border border-warmGray-200/50 hover:border-peach-200 group hover:-translate-y-1"
                >
                  {/* Card Header - Names */}
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-peach-100 to-peach-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-peach-700">
                          {evaluation.employee_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-warmGray-800 truncate">
                        {evaluation.employee_name}
                      </p>
                      <p className="text-xs text-warmGray-600">
                        avec {evaluation.partner_name}
                      </p>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center justify-center mb-4">
                    <div className="flex items-center space-x-1">
                      {renderStars(evaluation.rating)}
                    </div>
                    <span className="ml-2 text-sm font-semibold text-warmGray-700">
                      {evaluation.rating.toFixed(1)}
                    </span>
                  </div>

                  {/* Comment */}
                  <div className="mb-4">
                    {evaluation.comment && evaluation.comment.trim().length > 0 ? (
                      <div className="bg-warmGray-50/70 rounded-lg p-3">
                        <p className="text-sm text-warmGray-700 italic leading-relaxed">
                          "{evaluation.comment.length > 120 ? evaluation.comment.substring(0, 120) + '...' : evaluation.comment}"
                        </p>
                      </div>
                    ) : (
                      <div className="bg-warmGray-50/70 rounded-lg p-3">
                        <p className="text-sm text-warmGray-500 italic">
                          Aucun commentaire fourni
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Date */}
                  <div className="flex items-center justify-between pt-3 border-t border-warmGray-200/50">
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="w-4 h-4 text-warmGray-400" />
                      <span className="text-xs text-warmGray-500">
                        {formatDate(evaluation.submitted_at)}
                      </span>
                    </div>
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                </div>
              ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <ChatBubbleLeftRightIcon className="h-16 w-16 text-warmGray-400 mx-auto mb-4" />
              <p className="text-warmGray-600 text-lg">Aucune évaluation récente</p>
              <p className="text-warmGray-500 text-sm mt-2">Les nouvelles évaluations apparaîtront ici</p>
            </div>
          )}
        </div>


      </div>
    </div>
  );
};

export default DashboardModern;
