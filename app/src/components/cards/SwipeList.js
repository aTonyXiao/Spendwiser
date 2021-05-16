import React from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
} from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';

export function SwipeList(
    {
        transactions
    }) {
    const renderItem = data => {
        var date = data.item.dateAdded.toString();
        var name = data.item.storeInfo.storeName;
        var dollarAmount = data.item.amountSpent;
        return (
            <View>
                <View style={{flexDirection: 'row', width: '90%', justifyContent: 'space-between'}}>
                    <View style={{flexDirection: 'column'}}>
                        <Text style={styles.transactionTextLeft}>{name}</Text>
                        <Text>{date}</Text>
                    </View>
                    <View style={{justifyContent: 'center'}}>
                        <Text>${dollarAmount}</Text>
                    </View>
                </View>
            </View>
        );
    };
    
    const renderHiddenItem = (data, rowMap) => (
        <View style={styles.rowBack}>
            <Text>Left</Text>
            <TouchableOpacity
                style={[styles.backRightBtn, styles.backRightBtnLeft]}
                onPress={() => closeRow(rowMap, data.item.key)}
            >
                <Text style={styles.backTextWhite}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.backRightBtn, styles.backRightBtnRight]}
                onPress={() => deleteRow(rowMap, data.item.key)}
            >
                <Text style={styles.backTextWhite}>Delete</Text>
            </TouchableOpacity>
        </View>
    );
    return (
        <View style={styles.container}>
            <SwipeListView
                data={transactions}
                renderItem={renderItem}
                renderHiddenItem={renderHiddenItem}
                rightOpenValue={-75}
            />
        </View>
    );
}

const styles = new StyleSheet.create({
    container: {
        backgroundColor: 'white',
        flex: 1,
    },
    rowFront: {
        alignItems: 'center',
        backgroundColor: '#CCC',
        borderBottomColor: 'black',
        borderBottomWidth: 1,
        justifyContent: 'center',
        height: 50,
    },
    rowBack: {
        alignItems: 'center',
        backgroundColor: '#DDD',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 15,
    },
});