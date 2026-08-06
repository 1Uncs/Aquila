import React, { useState } from 'react';
import
{
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    FlatList,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Fonts } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import { MetricCard } from '../components/MetricCard';
import { Badge } from '../components/Badge';

const SUMMARY_STATS = {
    totalPUs: '176,846',
    reportingPUs: '142,309',
    completionRate: '80.47%',
    totalVotesCast: '14,892,110',
    activeIncidents: '24',
};

const PARTY_VOTE_SHARE = [
    { code: 'APC', name: 'All Progressives Congress', votes: '5,820,140', percent: '39.1%', color: Colors.party.APC },
    { code: 'PDP', name: 'Peoples Democratic Party', votes: '4,610,230', percent: '30.9%', color: Colors.party.PDP },
    { code: 'LP', name: 'Labour Party', votes: '3,921,400', percent: '26.3%', color: Colors.party.LP },
    { code: 'NNPP', name: 'New Nigeria Peoples Party', votes: '540,340', percent: '3.7%', color: Colors.party.NNPP },
];

const RECENT_INCIDENTS = [
    { id: 'INC-102', location: 'PU 004, Alausa, Ikeja, Lagos', title: 'BVAS Malfunction', severity: 'high', status: 'In Review', time: '12 mins ago' },
    { id: 'INC-098', location: 'PU 012, Surulere, Lagos', title: 'Delayed Material Arrival', severity: 'medium', status: 'Pending', time: '28 mins ago' },
    { id: 'INC-084', location: 'PU 001, Eti-Osa, Lagos', title: 'Overcrowding / Line Control', severity: 'low', status: 'Resolved', time: '1 hour ago' },
];

export default function DashboardScreen()
{
    const router = useRouter();
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<'overview' | 'incidents'>('overview');

    const handleLogout = () =>
    {
        logout();
        router.replace('/');
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                <View style={styles.userBar}>
                    <View>
                        <Text style={styles.userRoleLabel}>ACTIVE SESSION</Text>
                        <View style={styles.roleBadgeContainer}>
                            <Feather name="user-check" size={14} color={Colors.primary} />
                            <Text style={styles.userRoleText}>{user?.role?.replace(/_/g, ' ')}</Text>
                        </View>
                        <Text style={styles.userEmail}>{user?.email}</Text>
                    </View>

                    <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
                        <Feather name="log-out" size={16} color={Colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.actionGrid}>
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: Colors.primary }]}
                        onPress={() => router.push('/results-entry')}
                        activeOpacity={0.85}
                    >
                        <Feather name="plus-circle" size={16} color="#FFFFFF" />
                        <Text style={styles.actionBtnTextPrimary}>Submit Result (EC8A)</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionBtnSecondary}
                        onPress={() => router.push('/report-incident')}
                        activeOpacity={0.85}
                    >
                        <Feather name="flag" size={16} color={Colors.textSecondary} />
                        <Text style={styles.actionBtnTextSecondary}>Report Incident</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionHeader}>NATIONAL COLLATION METRICS</Text>
                <View style={styles.metricsRow}>
                    <MetricCard
                        label="Reporting PUs"
                        value={SUMMARY_STATS.reportingPUs}
                        subValue={`of ${SUMMARY_STATS.totalPUs} total`}
                        accentColor={Colors.primary}
                        iconName="check-circle"
                    />
                    <MetricCard
                        label="Completion"
                        value={SUMMARY_STATS.completionRate}
                        subValue="Collation Progress"
                        accentColor={Colors.party.APC}
                        iconName="pie-chart"
                    />
                </View>

                <View style={[styles.metricsRow, { marginTop: 8 }]}>
                    <MetricCard
                        label="Total Votes"
                        value="14.89M"
                        subValue="Valid ballots count"
                        accentColor={Colors.party.PDP}
                        iconName="archive"
                    />
                    <MetricCard
                        label="Incidents"
                        value={SUMMARY_STATS.activeIncidents}
                        subValue="Requires Attention"
                        accentColor={Colors.status.critical}
                        iconName="alert-octagon"
                    />
                </View>

                <View style={styles.cardContainer}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardHeaderTitle}>PRESIDENTIAL VOTE SHARE</Text>
                        <View style={styles.liveIndicator}>
                            <View style={styles.liveDot} />
                            <Text style={styles.liveText}>LIVE</Text>
                        </View>
                    </View>

                    {PARTY_VOTE_SHARE.map((party) => (
                        <View key={party.code} style={styles.partyRow}>
                            <View style={styles.partyMeta}>
                                <View style={[styles.partyBadge, { backgroundColor: party.color }]}>
                                    <Text style={styles.partyBadgeText}>{party.code}</Text>
                                </View>
                                <View style={{ flex: 1, marginLeft: 10 }}>
                                    <Text style={styles.partyName}>{party.name}</Text>
                                    <Text style={styles.partyVotes}>{party.votes} votes</Text>
                                </View>
                                <Text style={styles.partyPercent}>{party.percent}</Text>
                            </View>
                            {/* Progress bar */}
                            <View style={styles.progressTrack}>
                                <View
                                    style={[
                                        styles.progressBar,
                                        { backgroundColor: party.color, width: party.percent },
                                    ]}
                                />
                            </View>
                        </View>
                    ))}
                </View>

                <View style={styles.cardContainer}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardHeaderTitle}>RECENT FIELD INCIDENTS</Text>
                        <TouchableOpacity onPress={() => router.push('/incidents')}>
                            <Text style={styles.viewAllText}>View All</Text>
                        </TouchableOpacity>
                    </View>

                    {RECENT_INCIDENTS.map((inc) => (
                        <View key={inc.id} style={styles.incidentRow}>
                            <View style={styles.incidentHeader}>
                                <Badge
                                    label={inc.severity}
                                    variant={inc.severity === 'high' ? 'danger' : inc.severity === 'medium' ? 'warning' : 'neutral'}
                                />
                                <Text style={styles.incidentTime}>{inc.time}</Text>
                            </View>
                            <Text style={styles.incidentTitle}>{inc.title}</Text>
                            <View style={styles.incidentFooter}>
                                <Feather name="map-pin" size={12} color={Colors.textMuted} />
                                <Text style={styles.incidentLocation}>{inc.location}</Text>
                            </View>
                        </View>
                    ))}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.bgPrimary,
    },
    scrollContent: {
        padding: 16,
    },
    userBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colors.bgSurface,
        borderColor: Colors.borderSubtle,
        borderWidth: 1,
        borderRadius: 8,
        padding: 14,
        marginBottom: 16,
    },
    userRoleLabel: {
        fontSize: 9,
        fontFamily: Fonts.bold,
        color: Colors.textMuted,
        letterSpacing: 0.5,
    },
    roleBadgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 2,
    },
    userRoleText: {
        fontSize: 14,
        fontFamily: Fonts.extraBold,
        color: Colors.textPrimary,
    },
    userEmail: {
        fontSize: 11,
        fontFamily: Fonts.regular,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    logoutBtn: {
        padding: 10,
        backgroundColor: Colors.bgPrimary,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: Colors.borderSubtle,
    },
    actionGrid: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 20,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 6,
        gap: 8,
    },
    actionBtnTextPrimary: {
        color: '#FFFFFF',
        fontFamily: Fonts.bold,
        fontSize: 12,
    },
    actionBtnSecondary: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.bgSurface,
        borderColor: Colors.borderSubtle,
        borderWidth: 1,
        paddingVertical: 12,
        borderRadius: 6,
        gap: 8,
    },
    actionBtnTextSecondary: {
        color: Colors.textPrimary,
        fontFamily: Fonts.semiBold,
        fontSize: 12,
    },
    sectionHeader: {
        fontSize: 11,
        fontFamily: Fonts.bold,
        color: Colors.textSecondary,
        marginBottom: 10,
        letterSpacing: 0.5,
    },
    metricsRow: {
        flexDirection: 'row',
        marginHorizontal: -4,
    },
    cardContainer: {
        backgroundColor: Colors.bgSurface,
        borderColor: Colors.borderSubtle,
        borderWidth: 1,
        borderRadius: 8,
        padding: 16,
        marginTop: 16,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    cardHeaderTitle: {
        fontSize: 11,
        fontFamily: Fonts.bold,
        color: Colors.textSecondary,
        letterSpacing: 0.5,
    },
    liveIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#DCFCE7',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.primary,
    },
    liveText: {
        fontSize: 9,
        fontFamily: Fonts.extraBold,
        color: Colors.primary,
    },
    partyRow: {
        marginBottom: 12,
    },
    partyMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    partyBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
    },
    partyBadgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontFamily: Fonts.extraBold,
    },
    partyName: {
        fontSize: 12,
        fontFamily: Fonts.bold,
        color: Colors.textPrimary,
    },
    partyVotes: {
        fontSize: 10,
        fontFamily: Fonts.regular,
        color: Colors.textMuted,
    },
    partyPercent: {
        fontSize: 13,
        fontFamily: Fonts.extraBold,
        color: Colors.textPrimary,
    },
    progressTrack: {
        height: 6,
        backgroundColor: '#F1F5F9',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 3,
    },
    viewAllText: {
        fontSize: 11,
        fontFamily: Fonts.bold,
        color: Colors.primary,
    },
    incidentRow: {
        borderTopWidth: 1,
        borderTopColor: Colors.borderSubtle,
        paddingTop: 10,
        marginTop: 10,
    },
    incidentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    incidentTime: {
        fontSize: 10,
        fontFamily: Fonts.regular,
        color: Colors.textMuted,
    },
    incidentTitle: {
        fontSize: 13,
        fontFamily: Fonts.bold,
        color: Colors.textPrimary,
        marginBottom: 4,
    },
    incidentFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    incidentLocation: {
        fontSize: 11,
        fontFamily: Fonts.regular,
        color: Colors.textSecondary,
    },
});