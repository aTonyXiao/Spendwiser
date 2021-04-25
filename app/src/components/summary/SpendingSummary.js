import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, SafeAreaView, StatusBar, FlatList } from 'react-native';
import { Footer } from '../util/Footer';
import { CategoryModal } from './CategoryModal';
import { PieChartSummary } from './PieChartSummary';
import { Ionicons } from '@expo/vector-icons';
import { user } from '../../network/user';
import { summaryHelper } from './SummaryHelper';
import { ListSummary } from './ListSummary';
import { HeaderAndTabContent } from './HeaderAndTabContent';
import { StackedChartCompare } from './StackedChartCompare';

const modalType = {
    DISABLED: 0,
    TIME: 1,
    CATEGORY: 2,
    TRANSACTIONS: 3,
    CARDS: 4,
    MODE: 5,
    MONTH: 6,
}
const modeType = {
    SUMMARY: "Summary",
    COMPARE: "Compare",
    BUDGET: "Budget",
}
const keys = ['Dining', 'Grocery', 'Drugstore', 'Gas', 'Home', 'Travel', 'Others'];
const colors = ['#FF0000', '#FF7F00', '#FFD700', '#228B22', '#0000FF', '#2E2B5F', '#8B00FF']

export function SpendingSummary({navigation}) {
    const [modalVisible, setModalVisible] = useState(modalType.DISABLED);
    const [curCategory, setCurCategory] = useState({
        label: 'All categories',
        value: 0,
    });
    const [curTimeframe, setCurTimeframe] = useState('This month');
    const [transactions, setTransactions] = useState([]);
    const [values, setValues] = useState([]);
    const [listViewEnabled, setListViewEnabled] = useState(false);
    const [cards, setCards] = useState([]);
    const [curCard, setCurCard] = useState(null);
    const [mode, setMode] = useState(modeType.SUMMARY);
    const [compareTransPeriod1, setCompareTransPeriod1] = useState([]);
    const [compareTransPeriod2, setCompareTransPeriod2] = useState([]);
    const [compareTimeframe, setCompareTimeframe] = useState([]);
    const [whichPeriod, setWhichPeriod] = useState(0);

    const userId = user.getUserId();
    function getCardFromDB(myCards) {
        setCards(myCards);
    }

    function changeCategory(cat) {
        setCurCategory({
            label: cat,
            value: cat === "All categories" ? values.reduce((a, b) => a + b, 0) : values[keys.indexOf(cat)],
        });
    };

    function setCurCardFromModal(cardName) {
        let curCardIdx = -1;
        if (cardName === "All Cards") {
            setCurCard(null);
        } else {
            curCardIdx = cards.findIndex(x => x["cardName"] === cardName);
            setCurCard(cards[curCardIdx]);
        }
        let tmpValues = Array(7).fill(0);
        for (var i = 0; i < transactions.length; i++) {
            if (curCardIdx === -1 || transactions[i]["cardId"] === cards[curCardIdx]["cardId"]) {
                tmpValues[summaryHelper.matchTransactionToCategory(transactions[i])] += parseFloat(transactions[i]['amountSpent']);
            }
        }
        setValues(tmpValues);
        setCurCategory({label: "All Categories", value: tmpValues.reduce((a, b) => a + b, 0)});
    };

    function setNewPeriod(date) {
        const dateSplit = date.split(' ');
        let newCompare = compareTimeframe;
        if (whichPeriod === 1) {
            newCompare[0] = new Date(dateSplit[0], dateSplit[1] - 1);
            setCompareTransPeriod1([]);
        } else {
            newCompare[1] = new Date(dateSplit[0], dateSplit[1] - 1);
            setCompareTransPeriod2([]);
        }
        setCompareTimeframe(newCompare);
        getCompareTimeframeTransactions(newCompare)
    }
    
    // Initialize transactions for compare mode
    function getCompareTimeframeTransactions(newCompareTimeframe) {
        if (newCompareTimeframe.length === 0) {
            return;
        }
        if (whichPeriod === 1 || whichPeriod === 0) {
            let endTimeFrame0 = new Date(newCompareTimeframe[0].getFullYear(), newCompareTimeframe[0].getMonth() + 1, 0);
            user.getTimeFrameTransactions(userId, newCompareTimeframe[0], endTimeFrame0, (data) => {
                setCompareTransPeriod1(oldData => [...oldData, data]);
            });
        }
        if (whichPeriod === 2 || whichPeriod === 0) {
            let endTimeFrame1 = new Date(newCompareTimeframe[1].getFullYear(), newCompareTimeframe[1].getMonth() + 1, 0);
            user.getTimeFrameTransactions(userId, newCompareTimeframe[1], endTimeFrame1, (data) => {
                setCompareTransPeriod2(oldData => [...oldData, data]);
            });
        }
    };

    // process each transaction retrieved from db after timeframe change
    useEffect(() => {
        if (transactions.length == 0) {
            return;
        }
        let tmpValues = values;
        let transaction = transactions[transactions.length - 1];
        if (curCard === null || transaction["cardId"] === curCard["cardId"])
            tmpValues[summaryHelper.matchTransactionToCategory(transaction)] += parseFloat(transaction['amountSpent']);
        setValues(tmpValues);
        setCurCategory((prevState) => {
            return { ...prevState, value: tmpValues.reduce((a, b) => a + b, 0)};
        });
    }, [transactions]);

    // Get transactions from db when timeframe change
    useEffect(() => {
        setValues(Array(7).fill(0));
        setTransactions([]);
        setCurCategory({
            label: 'All categories',
            value: 0,
        });
        let [startTimeFrame, endTimeFrame] = summaryHelper.getTimeFrame(curTimeframe);
        user.getTimeFrameTransactions(userId, startTimeFrame, endTimeFrame, (data) => {
            setTransactions(oldData => [...oldData, data]);
        });
    }, [curTimeframe]);

    // Load card names and id, and COMPARE mode info when mount
    useEffect(() => {
        summaryHelper.getDbCards(getCardFromDB);
        let [startTimeFrame, endTimeFrame] = summaryHelper.getTimeFrame("Last 2 months");
        let thisMonth = new Date(endTimeFrame.getFullYear(), endTimeFrame.getMonth());
        console.log(thisMonth + " " + startTimeFrame);
        setCompareTimeframe([thisMonth, startTimeFrame]);
        getCompareTimeframeTransactions([thisMonth, startTimeFrame]);
    }, []);

    return (
        <SafeAreaView style={styles.screen}>
            <CategoryModal
                modalType = {modalType}
                modalVisible = {modalVisible}
                setModalVisible = {setModalVisible}
                curTimeframe = {curTimeframe}
                setCurTimeframe = {setCurTimeframe}
                curCategory = {curCategory}
                changeCategory = {changeCategory}
                values = {values}
                transactions = {transactions}
                cards = {cards}
                curCard = {curCard}
                setCurCardFromModal = {setCurCardFromModal}
                modeType={modeType}
                mode={mode}
                setMode={setMode}
            />

            {/* Header and Tabs */}
            <HeaderAndTabContent
                modalType={modalType}
                curCard={curCard}
                curTimeframe={curTimeframe}
                mode={mode}
                modeType={modeType}
                curCategory={curCategory}
                setModalVisible={setModalVisible}
                compareTimeframe = {compareTimeframe}
                setNewPeriod = {setNewPeriod}
                setWhichPeriod = {setWhichPeriod}
            />
            {/* Content */}
            <View style={styles.contentContainer}>
                {mode === modeType.SUMMARY && !(listViewEnabled) &&
                    <PieChartSummary
                        style={{height:500}}
                        values={values}
                        keys={keys}
                        curCategory={curCategory}
                        setCurCategory={setCurCategory}
                        setModalVisible={setModalVisible}
                        colors={colors}
                    />
                }
                {mode === modeType.SUMMARY && listViewEnabled &&
                    <ListSummary
                        setModalVisible={setModalVisible}
                        changeCategory={changeCategory}
                        values={values}
                    />
                    
                }
                {mode === modeType.COMPARE &&
                    <StackedChartCompare
                        compareTransPeriod1={compareTransPeriod1}
                        compareTransPeriod2={compareTransPeriod2}
                        keys={keys}
                        curCard={curCard}
                        compareTimeframe={compareTimeframe}
                    />
                }
            </View>
            {mode === modeType.SUMMARY &&
                <View style={styles.viewType}>
                    <Ionicons
                        name="list-outline"
                        color="blue"
                        size={15}
                    ></Ionicons>
                    <Text 
                        style={{color: 'blue', marginLeft: 5}}
                        onPress={() => {setListViewEnabled(!listViewEnabled)}}
                    >{listViewEnabled ? "Chart View" : "List View"}</Text>
                </View>
            }
            {/* Footer */}
            <View style={styles.footerContainer}>
                <Footer navigation={navigation} />
            </View>
        </SafeAreaView>
    )
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: 'white',
        height: '100%',
        paddingTop: StatusBar.currentHeight,
        alignItems: 'center',
        flexDirection: 'column',
    },
    contentContainer: {
        flex: 5,
        width: '100%',
    },
    viewType: {
        flexDirection:'row',
        alignItems: 'flex-end',
        paddingBottom: 10,
        width: '100%',
        justifyContent: 'center',
    },
    footerContainer: { 
        width: '100%',
        backgroundColor: 'white',
        // position: 'absolute', 
        bottom: 0, 
        paddingBottom: 35,
        marginTop: 0
    },
});