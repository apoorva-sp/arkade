import "../styles/loadingstyle.scss"
import "../styles/loadingstyle.css"
export default function Loadingspinner(){
    return(<>
        <div className="spinner-border" role="status">
            <span className="visually-hidden" >Loading...</span>
          </div>
    </>);
}