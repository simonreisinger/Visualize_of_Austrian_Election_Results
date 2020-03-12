# Static Charts with Python

The goal of this exercise is to get into some first contact with Python, Pandas data frames, and the many opportunities how to quickly generate static charts from data frames.

For the first exercise, show the results of the election per state (Bundesland) and party using two simple charts of your choice. The data is provided as a CSV file with the states as rows and the parties (in percentages) as columns. Describe in a few sentences what can be seen in your visualizations. Visualization techniques could be (but are not limited to):

    Parallel coordinates with parties or states (Bundesländer) as axes
    Grouped bar charts, grouped by parties or states
    Pie charts for each state
    Radviz of states
    Scatterplot matrix showing the party share over the states or the percentage in the states for the parties
    Principal components of the states (using PCA) in a 2D scatterplot


## Useful links:

* Jupyter Notebook Documentation
* Colab Notebook How-To
* Pandas Data Analysis and Manipulation Tool: Documentation
* Matplotlib
* Pandas visualizations based on Matplotlib  
* Seaborn
    
    
## Implementation hints

Load the data using pandas and show the table in the notebook:

    import pandas as pd
    df = pd.read_csv("NRW2019_Bundeslaender.csv")
    df

Depending on your chosen visualization, you might want to use the Austrian official party colors. Depending on the chosen visualization library, you will need to use the Matplotlib colormap (cm) or the color list (colors).

    from matplotlib.colors import LinearSegmentedColormap


    colors = ['#63C3D0', '#ce000c', '#0056A2', '#E3257B', '#ADADAD', '#88B626', '#333333']
    cm = LinearSegmentedColormap.from_list('austrianParties', colors, N=7)
