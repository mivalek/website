---
title: The Fall of the Boulder Gods
subtitle: Making data analytics fun
head_js: assets/tops_data.js
footer_js: assets/script.js
head_css: assets/style.css
---

<div id="details">
    <h3 id="name-div"></h3>
    <div id="details-grid">
        <div class="col-1">
            <div id="athlete-grid">
                <div class="flex-column">
                    <div class="table" id="birth-year-div">
                        <div>Born:</div>
                        <div id="birth-year"></div>
                    </div>
                    <div class="table" id="active-since-div">
                        <div>Active since:</div>
                        <div id="active-since"></div>
                    </div>
                </div>
                <div class="flex-column">
                    <div class="table" id="height-div">
                        <div>Height:</div>
                        <div id="height"></div>
                    </div>
                    <div class="table" id="country-div">
                        <div>Country:</div>
                        <div id="country"></div>
                    </div>
                </div>
            </div>
            <div id="medals">
                <div id="gold" class="medal"></div>
                <div id="silver" class="medal"></div>
                <div id="bronze" class="medal"></div>
            </div>
        </div>
        <div class="col-2">
            <div class="table" id="events-div">
                <div>Events:</div>
                <div id="participations"></div>
            </div>
            <div class="table" id="tops-div">
                <div>Boulders topped:</div>
                <div id="tops"></div>
            </div>
            <div class="table" id="medals-per-event-div">
                <div>Medals/Event:</div>
                <div id="medals-per-event"></div>
            </div>
            <div class="table" id="tops-per-event-div">
                <div>Tops/Event:</div>
                <div id="tops-per-event"></div>
            </div>
            <div class="table" id="fall-freq-div">
                <div>Attempts/Top:</div>
                <div id="fall-freq"></div>
            </div>
        </div>
    </div>
</div>
<div id="text-container">
        <div id="info" class="beating">i</div>
        <div id="description">
            <p>Elite boulderers don't tend to fall a lot but there are still differences in how often they do.
            </p>
            <p>Based on the results from all IFSC bouldering World cups and World championships from 2004, this
                visualisation compares the performance of the 14 most decorated climbers.</p>
            <p>The height the heads reach represents the number of boulders topped at these events and the
                frequency
                with which they drop represents number of attempts per topped boulder. For example, in her
                lustrous
                career spanning almost 20 years, Noguchi Akiyo topped the most World cup and World champs
                boulders
                (895) and, while doing so,
                fell the least often. Akiyo retired in 2021 after winning bronze at the first ever Olympic
                climbing
                competition. I still miss her... &#128546;</p>
            <p>Hover over heads to see more interesting statistics.</p>
            </p>
        </div>
    </div>
<div id="main-section-container">
    <div id="viz-backgroud"></div>
    <div id="viz-container">
        <div id="viz"></div>
        <div id="credit">
            <h5>Sources</h5>
            <div>Data and athlete photos: <a href="https://ifsc.results.info/#/" target="_blank">IFSC Results
                    Service</a></div>
            <div>Background photo: <a href="https://www.oakwoodclimbingcentre.com/" target="_blank">Oakwood
                    climbing
                    centre</a>
            </div>
        </div>
    </div>
</div>
<style id="animations"></style>
