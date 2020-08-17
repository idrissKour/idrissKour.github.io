import * as React from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';

import {useState, useContext} from 'react'
import { FirebaseContext } from '../Firebase'


import { useHistory } from "react-router-dom";

// CSS ----------------------------------------------------------------------------------------
const useStyles = makeStyles((theme) => ({

  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

// Fonction SignIn ---------------------------------------------------------------------------
export default function SignIn(props) {
  const classes = useStyles();


  const history = useHistory();

  const firebase = useContext(FirebaseContext);

  // Variables ----------------------------------------------------------------------------
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Message d'erreur ---------------------------------------------------------------------
  const [error, setError] = useState('');

  // Gestion de l'envoie du formulaire ----------------------------------------------------
  const handleSubmit = e => {
   e.preventDefault()
   firebase.loginUser(email, password)
   .then(user => {
     setEmail('');
     setPassword('');
     history.push("/Welcome");
   })
   .catch(error => {
     setError(error)
    setEmail('');
    setPassword('');
   })
   
  }

  return (

    
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Entrez vos identifiants
        </Typography>

        <form className={classes.form} noValidate onSubmit={handleSubmit}>
          
          {/* Champs  email ------------------------------------------------------------------------ */}
          <TextField
            
            onChange={ e => setEmail(e.target.value) }
            value={email}
            
            variant="outlined"
            margin="normal"
            required
            fullWidth
            // id="email"
            label="Email"
            name="email"
            autoComplete="off"
            autoFocus
          />

          {/* Champs password ---------------------------------------------------------------------- */}
          <TextField
            
            onChange={ e => setPassword(e.target.value) }
            value={password}
            
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            // id="password"
            autoComplete="off"
          />

          {/* Bouton Connexion ---------------------------------------------------------------------- */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            className={classes.submit}
          >
            Connexion
          </Button>
        </form>

        {error !== '' && <span> {error.message} </span>}

      </div>
    </Container>
  );
}
