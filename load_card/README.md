# Load Card Firebase Script

This folder is a dedicated script for loading cards into the Firebase database

## Preqrequisites

Make sure that you have a 'Firebase Admin Private Key' generated.  See the 'Firebase Admin Private Key' section under 'Database Server Setup' for more details.  In this same directory, make sure that key is named `firebase_admin.json` so that it can be properly utilized for database access.

Before use, run the following to make sure all modules are installed:

```
npm install
```

## Usage 

To use the script, use the following command from the terminal to load in all the cards that are provided in `cards_data.json`: 

```
node load cards_data.json
```

*Note: It is important this is run once, otherwise there might be duplicate cards in the 'cards' collection on Firebase*

## JSON File Format

If additional or custom cards are desired, create a JSON file using the following template:

```
{
    "cards": [
        {
            "rewards": {
                "reward": 0
            },
            "name": "Template Card",
            "image": "<IMAGE_URL>",
            "conversion": 1.0,
            "url": "<CARD_INFO_URL>",
            "rewardType": "RewardType",
            "benefits": [
                "Benefit1",
                "Benefit2"ß
            ]
        }
    ]
}
```

See `cards_data.json` for more examples.