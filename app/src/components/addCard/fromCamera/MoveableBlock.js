import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { DragResizeBlock } from 'react-native-drag-resize';

export function MoveableBlock({moveableBlocks, setMoveableBlocks, i, forceReRender}) {
    const [isSelected, setIsSelected] = useState(false);

    useEffect(()=> { 
        console.log(i)
        setIsSelected(moveableBlocks[i]);
    })

    // zIndex is added to all components to render above image
    return (
        <View style={{zIndex: 900}}>
            <DragResizeBlock
                x={0}
                y={0}
                onPress={()=> {
                    console.log('press')
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