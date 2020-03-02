# BCIT

BCIT is a tool for analyzing the interactions between compliance, business process 
and information technology. Furthermore BCIT is able to propose compliant business process models through the integration of alternative compliance processes.

## Content
- [Features](#features)
- [Run](#Run)
- [Video](#Video)
- [Resources](#Resources)

## Features
- Import business process modelled as *.bpmn, import IT architecture modelled as TOGAF Open Exchange Format and import compliance requirement model 
- Connect the model elements together
- Analyze the interactions between compliance and business process change [1] 
- Define alternative compliance processes to compliance requirements [2]
- Automatically propose compliant business process in case of a compliance violation [2]
- Export compliant business processes as *.bpmn 

## Run
You can run BCIT in two different ways:
- You can use it online on [https://anonymforreview.github.io/anonymForReview/](https://anonymforreview.github.io/anonymForReview/)
- You can run it locally:
   1. Open a terminal 
   2. Clone the repository `git clone https://github.com/anonymForReview/bcit.git`
   3. Change directory `cd compliance-checker-master`
   4. Install dependencies `npm install` 
   5. Start BCIT `npm run start`
   6. Open BCIT in your preferred browser

**Requirements**
- Firefox version -1 or Chrome version -1 (in both cases a desktop version is required)

**Further requirements for local usage**
- [Git](https://git-scm.com/downloads)
- [Node.JS](https://nodejs.org/en/download/) >= 10.15

### Video
- A demo video that introduces the basic features of BCIT is available [here](https://cloud.uni-halle.de/s/q09oK57WnqgvZyr).

## Resources
- In [/resources/](/resources/) we provide additional information and documents.
Especially for working with the files in the Projects folder, we recommend cloning the entire repository via `git clone https://github.com/anonymForReview/bcit.git`.

```
.
├── ...
├── resources                       # additional resources
│   ├── 1-tutorial                  # tutorial document that describes the basic features step-by-step   
│   ├── 2-project data              # two sample projects including the individual compliance model, process model and IT infrastructure model
│   │   ├── demo project            # demonstrates the motivation scenario in the paper
│   │   └── extended demo project   # second demo used in the evaluation
│   ├── 3-evaluation                # questionnaire, evaluation results and histogram of the evaluation results
│   └── 4-pseudocoode               # pseudocode of algorithm
└── ...
```

### Project Data
- Each project data folder contains the same file types.
```
.   
└──resources
    └── 2-project data              
        ├── demo project            
        │    ├── BCIT project.bcit              # includes the complete demo project 
        │    ├── compliance model.json          # compliance model used in the demo project
        │    ├── it architecture model.xml      # it architecture used in the demo project
        │    └── process model.bpmn             # business process used in the demo project
        └── extended demo project   
             └── ...

```