import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { DragResizeBlock } from 'react-native-drag-resize';

/**
 * Wrapper for DragResizeBlock that keeps a selected state for styling purposes
 * 
 * @param {{Array, Object, Integer, function}} obj - parameter object
 * @param {Array} obj.moveableBlocks - list of booleans that represent selected/unselected boxes on screen
 * @param {Object} obj.setMoveableBlocks - React useState function sets moveableBlocks array
 * @param {Integer} obj.i - key number of block
 * @param {function} obj.forceReRender - function passed from parent function that will force the parent component to rerender
 * @module MoveableBlock
 */
export function MoveableBlock({moveableBlocks, setMoveableBlocks, i, forceReRender}) {
    const [isSelected, setIsSelected] = useState(false);

    useEffect(()=> { 
        setIsSelected(moveableBlocks[i]);
    })

    // zIndex is added to all components to render above image
    return (
        <View style={{zIndex: 900}}>
            <DragResizeBlock
                x={0}
                y={0}
                onPress={()=> {
                    // choosing only the current block as selected
                    let newBlocks = moveableBlocks;
                    for (let j=0 ; j<newBlocks.length; j++) { 
                        newBlocks[j] = false;
                    }
                    newBlocks[i] = true;
                    setMoveableBlocks(newBlocks);
                    forceReRender();
                }}
            >
                <View
                    style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: isSelected ? 'yellow' : 'black',
                        zIndex: 900
                    }}
                />
            </DragResizeBlock>
        </View>
    )
}