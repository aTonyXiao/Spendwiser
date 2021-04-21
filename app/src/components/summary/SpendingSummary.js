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

    function getCardFromDB(myCards) {
        setCards(myCards);
    }

    function changeCategory(cat) {
        console.log(cat);
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
        const userId = user.getUserId();
        let [startTimeFrame, endTimeFrame] = summaryHelper.getTimeFrame(curTimeframe);
        user.getTimeFrameTransactions(userId, startTimeFrame, endTimeFrame, (data) => {
            setTransactions(oldData => [...oldData, data]);
        });
    }, [curTimeframe]);

    // Load card names and id when mount
    useEffect(() => {
        summaryHelper.getDbCards(getCardFromDB);
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
                curCategory={curCategory}
                setModalVisible={setModalVisible}
            />
            {/* Content */}
            <View style={styles.contentContainer}>
                {mode === modeType.SUMMARY &&
                    !(listViewEnabled) ?
                    <PieChartSummary
                        style={{height:500}}
                        values={values}
                        keys={keys}
                        curCategory={curCategory}
                        setCurCategory={setCurCategory}
                        setModalVisible={setModalVisible}
                        colors={colors}
                    />
                    :
                    <ListSummary
                        setModalVisible={setModalVisible}
                        changeCategory={changeCategory}
                        values={values}
                    />
                    
                }
                {mode === modeType.COMPARE &&
                    <StackedChartCompare/>
                }
            </View>
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