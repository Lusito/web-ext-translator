import * as React from "react";
import { connect } from "react-redux";
import { State, LoadedExtension } from "../../shared";
import Toolbar from "../Toolbar";
import MarkdownPreview from "../MarkdownPreview";
import Dialogs from "../Dialogs";
import { TranslationTable } from "../TranslationTable";
import { LoadingScreen } from "../LoadingScreen";
import { WelcomeScreen } from "../WelcomeScreen";

interface WetAppProps {
    loading: string;
    extension: LoadedExtension | null;
}

function WetApp({ loading, extension }: WetAppProps) {
    return <React.Fragment>
        {loading && <LoadingScreen label={loading} />}
        {!loading && <main>
            <Toolbar />
            {extension ? <TranslationTable extension={extension} /> : <WelcomeScreen/>}
        </main>}
        {!loading && <MarkdownPreview />}
        <Dialogs />
    </React.Fragment>;
}

function mapStateToProps({ loading, extension }: State) {
    return { loading, extension };
}

export default connect<WetAppProps>(mapStateToProps)(WetApp);
