import React from 'react'
import './.css';

import { Button, TextField, 
    ListItemSecondaryAction,
    makeStyles, 
    Table, TableRow, TableBody, TableCell, TableContainer, TableHead,
    Paper,
    Dialog, DialogTitle, DialogContent, DialogContentText,
 } from '@material-ui/core';

import 'date-fns';


import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker,
  } from '@material-ui/pickers';

import DateFnsUtils from '@date-io/date-fns';

import {useState, useContext} from 'react'
import { FirebaseContext } from '../Firebase'


const useStyles = makeStyles({
    table: {
      minWidth: 550,
    },

    tableRow: {
        "&$selected, &$selected:hover": {
          backgroundColor: "#E8E8E8" 
        }
      },
    hover: {},
    selected: {}
    
  });


const Welcome = () => {

    const classes = useStyles();

    // > Variables ----------------------------------------------------------------------------

    // >> Conversion de la date (timestamp) ---------------------------------------

    // >>> année/mois/jour
    const amj = new Intl.DateTimeFormat("fr-Fr", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      // >>> heure:minute:second
      const hm = new Intl.DateTimeFormat("fr-Fr", {
        hour: '2-digit', 
        minute: '2-digit'
      });  
     
    // >> Variables concernant la base de donnée ---------------------------------
    const firebase = useContext(FirebaseContext);
    const [attr, setAttr] = React.useState([]);
    const [utilisateur, setUtilisateur] = useState('');
    const [debutH, setDebutH] = useState("00:00");
    const [finH, setFinH] = useState("00:00");
    const [poste, setPoste] = useState("");
    const [selectedDate, setSelectedDate] = React.useState(Date.now); // Si on souhaite récupérer cette valeur (Data.now) faire 
                                                                      //  amj.format(...).toString() 
    const [id, setId] = useState('');     
    
    const [btnAM, setbtnAM] = useState('Ajouter');    

    // Gestion de la boite de dialogue                                                                   
    const [msgErr, setMsgErr] = useState("");
    const [open, setOpen] = React.useState(false);
    const handleClose = () => { setOpen(false) };

    // Récupère l'index de la ligne du tableau quand celle-ci est cliqué.
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [rowIsSelected, setRowIsSelected] = useState(false);
 


    // Fonctions -----------------------------------------------------------------------------------------

    const attributionPossible = () => {

        var res = null
        var index = null 
        const _date = amj.format(selectedDate).toString()

        if(!rowIsSelected) {
            index =  attr.findIndex((item) => (
                item.poste == poste && item.date == _date && 
                (item.heure.split(" - ")[0] < finH && item.heure.split(" - ")[1] > debutH)
                ));
        } else{
            index = attr.filter((value, index) => selectedIndex !== index).findIndex((item) => (
                item.poste == poste && item.date == _date && 
                (item.heure.split(" - ")[0] < finH && item.heure.split(" - ")[1] > debutH)
                ));
        }

        return(index)

    }

    const creneauxConforme = () => { return debutH > finH ? false : true }  // Vérifie si la date de fin n'est pas postérieur à la date de début. 
    const postConforme     = () => { if(poste < 0){ setPoste(0) } }         // Vérieifie si l'admin n'a pas entré un numéro de poste négatif.
    React.useEffect(() => { postConforme() })

    // Récupération de la date ------------------------------------------------------
    const handleDateChange = (date) => {
        setSelectedDate(date);
      };
 

    // Traitement de la base de donnée -----------------------------------------------------------------------------

    // Gestion de l'envoie du formulaire pour l'ajout ou la modifcation d'une attribution -------------------------------
    const onUpdate = e => {
        e.preventDefault()
    
        if(creneauxConforme() && poste > -1){
            const db = firebase.db;
            var index = attributionPossible()
            if(index == -1){
                // Ajout -----------------------------------------------
                if(!rowIsSelected){
                    db.collection('Attribution').add({
                        utilisateur: utilisateur,
                        poste: poste,
                        date: amj.format(selectedDate).toString(),
                        heure: debutH + " - " + finH
                    })                    
                // Modification -----------------------------------------    
                } else{
                    db.collection('Attribution').doc(id).set({...attr,
                        utilisateur: utilisateur,
                        poste: poste,
                        date: amj.format(selectedDate).toString(),
                        heure: debutH + " - " + finH
                    })
                    btnCancel()
                }
            } else{
                console.log(index, selectedIndex)
                index = index >= selectedIndex ? index+1 : index 
                setMsgErr("Le poste est déjà attribué à " + attr[index].id)
                setSelectedIndex(index)
                setOpen(true)
                setRowIsSelected(false)
            }
        } else { 
            setMsgErr("L'heure de début est postérieur à l'heure de fin")
            setOpen(true)
    
        }
    
    }

    // Supression ---------------------------------------------------------------------
    const onDelete = e => {
        e.preventDefault()
        if(attr.some((item) => (item.id == id))){
            const db = firebase.db;
            db.collection('Attribution').doc(id).delete()
            setId('')
            setRowIsSelected(false)
        } else{ 
            setMsgErr("Cet identifiant n'est pas présent dans la base de donnée")
            setOpen(true)
        }

    }

    // Récupération de la base de donnée --------------------------------------------  
    React.useEffect(() => {
        const db = firebase.db;
        return db.collection("Attribution").onSnapshot((snapshot) => {
            const attrData = []
            snapshot.forEach(doc => attrData.push(({ ...doc.data(), id: doc.id }))) 
            setAttr(attrData)
            }); 
        }, []);

    // Récupération des informations à partir du tableau ----------------------------------------------------------
    const selectRow = (i) => {

        // const index = e.target.parentElement.getAttribute('data_key')
        const index = i
        setRowIsSelected(true)
        setSelectedIndex(index)
        setUtilisateur(attr[index].utilisateur)
        setPoste(attr[index].poste)
        setId(attr[index].id)

        const sd = attr[index].date.split("/")                // On doit transformé la format de la date qui est en fr en us
        const usDate = sd[1] + "/" + sd[0] + "/" + sd[2]
        setSelectedDate(Date.parse(usDate));                  // Puis on transformé cette date en format timestamps

        const splitHeure = attr[index].heure.split(" - ")    
        setDebutH(splitHeure[0])
        setFinH(splitHeure[1])

        setbtnAM("Modifier")

    }

    const btnCancel = () => {
        setSelectedIndex(null)
        setRowIsSelected(false)
        setbtnAM("Ajouter")
        setUtilisateur(""); setPoste(""); setId(""); setDebutH(hm.format(Date.now()).toString()); setFinH("00:00"); 
        setSelectedDate(Date.now)
    }


    // ==============================================================================================================================

  

    return(

        <div className="row" >

            {/* Table ------------------------------------------------------------------------------------------------------ */}    
            <div className="column1">

                <h2> Attribution </h2>

                <TableContainer component={Paper}>
                    <Table aria-label="simple table" >
                        <TableHead>
                        <TableRow > 
                            <TableCell > </TableCell>
                            <TableCell >Id</TableCell>
                            <TableCell align="right"> Utilisateur</TableCell>
                            <TableCell align="right"> Poste&nbsp;</TableCell>
                            <TableCell align="right"> Date&nbsp;</TableCell>
                            <TableCell align="right"> Heure&nbsp;</TableCell>
                        </TableRow>
                        </TableHead>
                        <TableBody>
                        {attr.map( (_attr, index) => (
                            <TableRow
                            hover
                            key={index} data_key={index} onClick={ () => {selectRow(index)}}
                            selected={selectedIndex === index}
                            classes={{ hover: classes.hover, selected: classes.selected }}
                            className={classes.tableRow}>
                            <TableCell> {index} </TableCell> 
                            <TableCell> {_attr.id} </TableCell>                              
                            <TableCell align="right"> {_attr.utilisateur} </TableCell>      
                            <TableCell align="right"> {_attr.poste} </TableCell>
                            <TableCell align="right"> {_attr.date} </TableCell>
                            <TableCell align="right"> {_attr.heure} </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                    </TableContainer>
            </div>

            {/* Ajout d'un utilisateur -------------------------------------------------------------------------------------- */}
            <div className="column">

                <h4> Ajout </h4>
                
                <form noValidate>

                    {/* Utilisateur -------------------------------------------------------------------------- */}
                    <TextField
                        onChange={ e => setUtilisateur(e.target.value) }
                        value={utilisateur}
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        label="utilisateur"
                        name="utilisateur"
                        autoComplete="off"
                        autoFocus
                    />
                    
                    {/*Date --------------------------------------------------------------------------------- */}
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <KeyboardDatePicker
                            disableToolbar
                            variant="inline"
                            format="dd/MM/yyyy"
                            margin="normal"
                            id="date"
                            label="Date"
                            value={selectedDate}
                            onChange={handleDateChange}
                            KeyboardButtonProps={{
                                'aria-label': 'change date',
                            }}
                        />
                    </MuiPickersUtilsProvider>

                    {/*Heure --------------------------------------------------------------------------------- */}

                    <div id = "time">

                        <p id="creneaux" > Crénaux </p>

                    {/* Début ------------------------------------------------------------- */}
                    <TextField
                        id="tfTime"
                        onChange={ e => setDebutH(e.target.value) }
                        value={debutH}
                        required
                        label="Début"
                        type="time"
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />

                    {/* Fin ----------------------------------------------------------------- */}
                    <TextField
                        id="tfTime"
                        onChange={ e => setFinH(e.target.value) }
                        required
                        value={finH}
                        label="Fin"
                        type="time"
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />

                    </div>

                    {/* numéro de poste ------------------------------------------------------------------------ */}
                    <TextField
                        onChange={ e => setPoste(e.target.value) }
                        required
                        value={poste}     
                        label="Poste"
                        type="number"
                        InputLabelProps={{
                          shrink: true,
                        }}
                        fullWidth
                        variant="outlined"
                        autoComplete="off"
                        autoFocus
                        margin="normal"
                    />

                    <br /> <br />

                    <div>

                    {/* Bouton ajouter ------------------------------------------------------------------------- */}
                    <Button onClick={onUpdate}
                        type="submit"
                        fullWidth
                        variant="contained"
                    >
                        {btnAM}
                    </Button>

                    <br /> <br />
                    <Button onClick={btnCancel}
                        disabled = {!rowIsSelected}
                        fullWidth
                        variant="contained"
                    >
                    Annuler
                    </Button>
                    
                    </div>

                </form>

            </div>

            {/* Suppression d'une attribution ---------------------------------------------------------------- */}
            
            <div className="column" >
                <h4> Suppresion </h4>

                <form noValidate onSubmit={onDelete}>
                {/* Id -------------------------------------------------------------------------- */}
                <TextField
                    onChange={ e => setId(e.target.value) }
                    value={id}
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    label="ID"
                    name="id"
                    autoComplete="off"
                    autoFocus
                />
                
                {/* Bouton Suppression --------------------------------------------------------- */}
                <Button 
                    type="submit"
                    fullWidth
                    variant="contained"
                >
                    Retirer
                </Button>

                </form>

            </div>

        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">{"Erreur"}</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description"> {msgErr} </DialogContentText>
            </DialogContent>
      </Dialog>

        </div>
    )
}

export default Welcome;