# Visualize the results of the national election 2019 in Austria. 
We will analyze and visualize the results of the national election 2019 in Austria. 
This project was created for the Course [Informationsvisualisierung](https://www.cg.tuwien.ac.at/courses/InfoVis/ue.html) at [TU Wien](https://www.tuwien.at).
* https://tuwel.tuwien.ac.at/course/view.php?id=21535

## Linked Views with d3
The goal of the second exercise is to create multiple coordinated views on web pages, where users can interactively explore the data.

In the second exercise, we will create a simple web page, where a map of Austria and a pie chart of the election results are shown. After loading the data from the provided CSV file, the exercise is split into the following tasks: 

* Fill the states in the map with the color of the party that reached the majority in this state. The colors are provided in data.js.
* Compute the percentages of votes for entire Austria and show as pie chart. Use the svg_pie container for the pie chart.
* Link the two charts. There are two possible options. If both options are implemented, 10 extra points can be scored:
 * By hovering over a state in the map, show the pie chart of the respective state, as well as the name of the selected state in the paragraph with ID state.
* By hovering over a segment in the pie chart, show a choropleth map of the votes of the selected party for all states. This can be achieved by changing the opacity of the respective state depending on the percentage.

Standard view: maximum results and pie chart for Austria: 

    Standard view: maximum results and pie chart for Austria:
    d3 exercise: Austria view
    Linking pie chart --> map (selection = ÖVP):
    Linking pie chart --> map
    Linking map --> pie chart (selection = Lower Austria):
    Linking map --> pie chart

There are many online d3 tutorials. Here is a small selection:
* Tutorials directly on d3 Github
* Tutorialspoint
* d3 wiki
* d3.v4 Tutorial by Square

There are numerous d3 implementations of standard charts out there. You can look at those existing implementations and adapt them to your needs, for example:

* https://observablehq.com/@d3/pie-chart
* How to render GeoJSON using d3
* US choropleth map

Mind that we are using d3.v5, which is no longer compatible to the more wide-spread d3.v3 used for many online examples! 

### TODOs
* Du kannst das mit dem Feldnamen so handhaben wie du möchtest. Es soll nur eine kleine Stolperfalle sein, da solche Dinge bei echten Datensätzen sehr oft vorkommen.
* Ich würde dir empfehlen das Intervall anzupassen, damit es für uns beim korrigieren eindeutiger sichtbar ist, dass du das implementiert hast. Aber auch hier gilt - solange wir sehen, dass du es implementiert hast sollte es passen, egal wie du es gemacht hast.
* Wir entwicken mit WebStorm und öffnen über die IDE das HTML - dann wird im Hintergrund automatisch ein Server von der IDE erstellt. In dem Fall funktioniert das Daten laden dann ganz einfach mit der d3.csv(datei) Funktion. Aber sofern deine Abgabe bei uns läuft und die Daten richtig geladen werden passt das.
* Die Reihenfolger der Parteien im Bar chart geben wir euch nicht vor und muss daher auch nicht immer gleich sein.


## Static Charts with Python

The goal of this exercise is to get into some first contact with Python, Pandas data frames, and the many opportunities how to quickly generate static charts from data frames.

For the first exercise, show the results of the election per state (Bundesland) and party using two simple charts of your choice. The data is provided as a CSV file with the states as rows and the parties (in percentages) as columns. Describe in a few sentences what can be seen in your visualizations. Visualization techniques could be (but are not limited to):

* Parallel coordinates with parties or states (Bundesländer) as axes
* Grouped bar charts, grouped by parties or states
* Pie charts for each state
* Radviz of states: https://pandas.pydata.org/docs/reference/api/pandas.plotting.radviz.html
* Scatterplot matrix showing the party share over the states or the percentage in the states for the parties
* Principal components of the states (using PCA) in a 2D scatterplot


### Useful links:

* Jupyter Notebook Documentation
* Colab Notebook How-To
* Pandas Data Analysis and Manipulation Tool: Documentation
* Matplotlib
* Pandas visualizations based on Matplotlib  
* Seaborn

### Resources 
Shape: https://www.eea.europa.eu/data-and-maps/data/eea-reference-grids-2/gis-files/austria-shapefile
    
    
### Implementation hints

Load the data using pandas and show the table in the notebook:

    import pandas as pd
    df = pd.read_csv("NRW2019_Bundeslaender.csv")
    df

Depending on your chosen visualization, you might want to use the Austrian official party colors. Depending on the chosen visualization library, you will need to use the Matplotlib colormap (cm) or the color list (colors).

    from matplotlib.colors import LinearSegmentedColormap


    colors = ['#63C3D0', '#ce000c', '#0056A2', '#E3257B', '#ADADAD', '#88B626', '#333333']
    cm = LinearSegmentedColormap.from_list('austrianParties', colors, N=7)


### TODOs
as we assign the final points during the submission talks at the end of the semester you get short written feedback regarding Exercise 1 here:
You provided some interpretation of the data for the bar charts, but we also want a description of the insights from the provided data one can gain from the pie charts.
We will not deduct a point here if you correct this during the submission talk.
Apart from that everything that was required was done.
