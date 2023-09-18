import os
import pandas as pd
from pathlib import Path

os.chdir(Path(__file__).parent)

def format_date(date_str):
    date_str = int(date_str)
    if date_str < 0:
        return f"{abs(date_str)} BC"
    return f"{abs(date_str)} CE"


raw_df = pd.read_excel("timeline raw data.xlsx")
raw_df = raw_df.sort_values(by='Start Date')

template_html = ""

for i, row in raw_df.iterrows():
    start_date = format_date(row['Start Date'])
    descr_text = row['Description']

    if str(row['End Date']) != 'nan':
        end_date = format_date(row['End Date'])
    else:
        print("No end date")
        end_date = None

    if end_date:
        if i % 2 == 0:
            template_html += fr"""
            <div class="timeline__item timeline__item--right fadeIn">
                <div class="timeline__item__inner">
                    <div class="timeline__content__wrap">
                        <div class="timeline__content">
                            <h2>{start_date} to {end_date}</h2>
                            <p>{descr_text}</p>
                        </div>
                    </div>
                </div>
            </div>

            """
        else:
            template_html += fr"""
            <div class="timeline__item timeline__item--left fadeIn">
                <div class="timeline__item__inner">
                    <div class="timeline__content__wrap">
                        <div class="timeline__content">
                            <h2>{start_date} to {end_date}</h2>
                            <p>{descr_text}</p>
                        </div>
                    </div>
                </div>
            </div>

            """

    else:
        if i % 2 == 0:
            template_html += fr"""
            <div class="timeline__item timeline__item--right fadeIn">
                <div class="timeline__item__inner">
                    <div class="timeline__content__wrap">
                        <div class="timeline__content">
                            <h2>{start_date}</h2>
                            <p>{descr_text}</p>
                        </div>
                    </div>
                </div>
            </div>

            """
        else:
            template_html += fr"""
            <div class="timeline__item timeline__item--left fadeIn">
                <div class="timeline__item__inner">
                    <div class="timeline__content__wrap">
                        <div class="timeline__content">
                            <h2>{start_date}</h2>
                            <p>{descr_text}</p>
                        </div>
                    </div>
                </div>
            </div>

            """

with open("my.html","w") as fp:
   fp.write(template_html)