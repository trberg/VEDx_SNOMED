# VEDX
###### A d3 tool for the Visual Exploration of Diagnosis Codes


## Overview
The VEDx dashboard is a flask/d3 application developed at the University of Washington for the visualization and interactive exploration of a clinical cohorts ICD-9-CM diagnosis codes. ICD-9-CM is a heirarchical coding standard used for diagnosis and billing at hospitals around the world. While ICD-9-CM was discontinued in 2015, and ICD-10-CM replaced it, the vast majority of Electronic Health Record data still currently has ICD-9-CM as the diagnosis code. For more information on ICD-9-CM, see [ICD9Data.com](icd9data.com).

## Install and Run
Clone this repository and enter the project
```
git clone https://github.com/UWMooneyLab/VEDx.git
cd VEDx
```

Use pip install on the requirements file to download dependances
```
pip install -r requirements.txt
```

To start the application, simply run
```
python application.py
```
The dashboard should fire up. If your browswer doesn't automatically open, go to you [localhost](http://127.0.0.1:5000) to see the dashboard.

## Dashboard Instructions
The dashboard contains a built-in tutorial that users can go through to learn how to use the tool and interact with the data.

The key area that will break the dashboard is bad data formats. It's important that the csv files that contain the ICD9 codes and their associated code or counts are formated correctly.

For a collection of ICD 9 counts, format the csv file as such:

| ICD 9 Code | counts |
|:----------:|:------:|
| 830.0      |  127   |
| 830.1      |  98    |
| 941.01     |  28    |
| 941.02     |  89    |
| 941.03     |  36    |
>The first column may be named "ICD 9 Code", "code", "codes", "icd 9 code", or "icd9 code". Everything else will break the dashboard. The second column must called "counts".


For a collection of ICD 9 scores (e.g. generated via statistical enrichment), format the csv file as such:

| ICD 9 Code | scores |
|:----------:|:------:|
| 830.0      |  127   |
| 830.1      |  98    |
| 941.01     |  28    |
| 941.02     |  89    |
| 941.03     |  36    |
>As in the case above, the first column may be named "ICD 9 Code", "code", "codes", "icd 9 code", or "icd9 code". Everything else will break the dashboard. The second column can be named "scores" or "score".

**Another important note**: The uploaded csv files do not need to be just two columns. All that is required is that the file have two columns that fit the naming schema above. The dashboard will ignore all columns not in the above examples.